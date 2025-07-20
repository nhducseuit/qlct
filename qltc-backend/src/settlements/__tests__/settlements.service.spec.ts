import { Test, TestingModule } from '@nestjs/testing';
import { SettlementsService } from '../settlements.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FamilyService } from '../../families/family.service';
import { NotificationsGateway } from '../../notifications/notifications.gateway';

describe('SettlementsService - calculatePairBalance (global, cross-family)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  let service: SettlementsService;
  let prisma: any;
  let familyService: any;
  beforeEach(async () => {
    prisma = {
      householdMembership: { findMany: jest.fn() },
      transaction: { findMany: jest.fn() },
      settlement: { findMany: jest.fn() },
    };
    familyService = { getFamilyTreeIds: jest.fn(), getAllFamilyIds: jest.fn() };
    const notificationsGateway = { sendToUser: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementsService,
        { provide: PrismaService, useValue: prisma },
        { provide: FamilyService, useValue: familyService },
        { provide: NotificationsGateway, useValue: notificationsGateway },
      ],
    }).compile();
    service = module.get<SettlementsService>(SettlementsService);
  });

it('correctly aggregates only over families where both persons have active memberships and user has access (realistic scenario)', async () => {
  // Test intent: Only family-1 is included: p1 pays 120, split 60/40, so p2 owes p1 48. Settlement: p2 paid p1 20, so p2 owes p1 28. family-2 and family-3 are ignored (no mutual membership or no access)
  // Sign convention: positive = personOne owes personTwo, negative = personTwo owes personOne
  const personOneId = 'p1';
  const personTwoId = 'p2';
  prisma.transaction.findMany.mockResolvedValue([
    {
      amount: 120,
      payer: 'm1',
      splitRatio: [
        { memberId: 'm1', percentage: 60 },
        { memberId: 'm2', percentage: 40 },
      ],
      familyId: 'family-1',
    },
  ]);
  prisma.settlement.findMany.mockResolvedValue([
    { payerId: personTwoId, payeeId: personOneId, amount: 20 },
  ]);
  // Mock accessible families for the user
  familyService.getAllFamilyIds.mockResolvedValue(['family-1', 'family-2', 'family-3']);
  const originalFindMany = prisma.householdMembership.findMany;
  prisma.householdMembership.findMany.mockImplementation(() => Promise.resolve([
    { id: 'm1', personId: personOneId, familyId: 'family-1', isActive: true, person: { name: 'A' } },
    { id: 'm2', personId: personTwoId, familyId: 'family-1', isActive: true, person: { name: 'B' } },
    { id: 'm3', personId: personOneId, familyId: 'family-2', isActive: true, person: { name: 'A' } },
    // personTwo is NOT a member of family-2
    // family-3 memberships (should be ignored)
    { id: 'm4', personId: personOneId, familyId: 'family-3', isActive: true, person: { name: 'A' } },
    { id: 'm5', personId: personTwoId, familyId: 'family-3', isActive: true, person: { name: 'B' } },
  ]));
  prisma.transaction.findMany.mockResolvedValue([
    {
      amount: 120,
      payer: 'm1',
      splitRatio: [
        { memberId: 'm1', percentage: 60 },
        { memberId: 'm2', percentage: 40 },
      ],
      familyId: 'family-1',
    },
  ]);
  prisma.settlement.findMany.mockResolvedValue([
    { payerId: personTwoId, payeeId: personOneId, amount: 20 },
  ]);
  try {
    const result = await service.calculatePairBalance(undefined, {
      personOneId,
      personTwoId,
      year: 2025,
      month: 6,
    });
    // Only family-1 is included: p1 pays 120, split 60/40, so p2 owes p1 48
    // Settlement: p2 paid p1 20, so p2 owes p1 28
    // family-2 and family-3 are ignored (no mutual membership or no access)
    expect(result.balances.length).toBe(1);
    expect(result.balances[0].personOneId).toBe(personOneId);
    expect(result.balances[0].personTwoId).toBe(personTwoId);
    expect(result.balances[0].netAmountPersonOneOwesPersonTwo).toBeCloseTo(-28, 1); // negative: personTwo owes personOne (sign convention enforced July 2025)
  } finally {
    prisma.householdMembership.findMany = originalFindMany;
  }
});

  it('calculates correct global balance across multiple families (single call, global logic)', async () => {
    // User has access to two families, both persons have memberships in both
    const accessibleFamilyIds = ['family-1', 'family-2'];
    const personOneId = 'p1';
    const personTwoId = 'p2';
    // Mock familyService to return all accessible families
    familyService.getFamilyTreeIds.mockResolvedValue(accessibleFamilyIds);
    familyService.getAllFamilyIds.mockResolvedValue(accessibleFamilyIds);
    prisma.householdMembership.findMany.mockResolvedValue([
      { id: 'm1', personId: personOneId, familyId: 'family-1', isActive: true, person: { name: 'A' } },
      { id: 'm2', personId: personTwoId, familyId: 'family-1', isActive: true, person: { name: 'B' } },
      { id: 'm3', personId: personOneId, familyId: 'family-2', isActive: true, person: { name: 'A' } },
      { id: 'm4', personId: personTwoId, familyId: 'family-2', isActive: true, person: { name: 'B' } },
    ]);
    prisma.transaction.findMany.mockResolvedValue([
      // Transaction in family-1: p1 pays for both
      {
        amount: 100,
        payer: 'm1',
        splitRatio: [
          { memberId: 'm1', percentage: 50 },
          { memberId: 'm2', percentage: 50 },
        ],
        familyId: 'family-1',
      },
      // Transaction in family-2: p2 pays for both
      {
        amount: 200,
        payer: 'm4',
        splitRatio: [
          { memberId: 'm3', percentage: 50 },
          { memberId: 'm4', percentage: 50 },
        ],
        familyId: 'family-2',
      },
    ]);
    prisma.settlement.findMany.mockResolvedValue([
      // p1 paid p2 30 in a settlement (should reduce what p2 owes p1)
      { payerId: personOneId, payeeId: personTwoId, amount: 30 },
      // p2 paid p1 10 in a settlement (should reduce what p1 owes p2)
      { payerId: personTwoId, payeeId: personOneId, amount: 10 },
    ]);
    // Call the global/cross-family balance calculation (should be a single call, not per-family aggregation)
    const result = await service.calculatePairBalance(undefined, {
      personOneId,
      personTwoId,
      year: 2025,
      month: 6,
    });
    // family-1: p1 pays 100, split 50/50, so p2 owes p1 50
    // family-2: p2 pays 200, split 50/50, so p1 owes p2 100
    // settlements: p1 paid p2 30, p2 paid p1 10
    // Net: (p2 owes p1 50) - (p1 owes p2 100) + 30 - 10 = -30
    // With new sign: expect 30 (personOne owes personTwo)
    expect(result.balances.length).toBe(1);
    expect(result.balances[0].personOneId).toBe(personOneId);
    expect(result.balances[0].personTwoId).toBe(personTwoId);
    expect(result.balances[0].netAmountPersonOneOwesPersonTwo).toBeCloseTo(30, 1);
  });

  it('throws ForbiddenException if either person is not a member of any accessible family', async () => {
    const accessibleFamilyIds = ['family-1', 'family-2'];
    const personOneId = 'p1';
    const personTwoId = 'p2';
    familyService.getAllFamilyIds.mockResolvedValue(accessibleFamilyIds);
    // Only personOne is a member
    prisma.householdMembership.findMany.mockResolvedValue([
      { id: 'm1', personId: personOneId, familyId: 'family-1', isActive: true, person: { name: 'A' } },
    ]);
    prisma.transaction.findMany.mockResolvedValue([]);
    prisma.settlement.findMany.mockResolvedValue([]);
    await expect(service.calculatePairBalance(undefined, {
      personOneId,
      personTwoId,
      year: 2025,
      month: 6,
    })).rejects.toThrow('One or both persons have no active memberships in this family.');
  });

  it('throws BadRequestException if personOneId or personTwoId is missing', async () => {
    await expect(service.calculatePairBalance(undefined, {
      personOneId: '',
      personTwoId: 'p2',
      year: 2025,
      month: 6,
    })).rejects.toThrow('Both personOneId and personTwoId are required.');
    await expect(service.calculatePairBalance(undefined, {
      personOneId: 'p1',
      personTwoId: '',
      year: 2025,
      month: 6,
    })).rejects.toThrow('Both personOneId and personTwoId are required.');
  });

  it('throws BadRequestException if personOneId and personTwoId are the same', async () => {
    await expect(service.calculatePairBalance(undefined, {
      personOneId: 'p1',
      personTwoId: 'p1',
      year: 2025,
      month: 6,
    })).rejects.toThrow('personOneId and personTwoId must be different.');
  });
});

describe('SettlementsService - calculatePairBalance (per-family, forbidden membership check)', () => {
  let service: SettlementsService;
  let prisma: any;
  let familyService: any;
  beforeEach(async () => {
    prisma = {
      householdMembership: { findMany: jest.fn() },
      transaction: { findMany: jest.fn() },
      settlement: { findMany: jest.fn() },
    };
    familyService = { getFamilyTreeIds: jest.fn(), getAllFamilyIds: jest.fn() };
    const notificationsGateway = { sendToUser: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementsService,
        { provide: PrismaService, useValue: prisma },
        { provide: FamilyService, useValue: familyService },
        { provide: NotificationsGateway, useValue: notificationsGateway },
      ],
    }).compile();
    service = module.get<SettlementsService>(SettlementsService);
  });

  it('throws ForbiddenException if a transaction exists in the family but one person is not a member', async () => {
    const familyId = 'family-1';
    const personOneId = 'p1';
    const personTwoId = 'p2';
    familyService.getFamilyTreeIds.mockResolvedValue([familyId]);
    prisma.householdMembership.findMany.mockResolvedValue([
      { id: 'm1', personId: personOneId, familyId, isActive: true, person: { name: 'A' } },
      // personTwo is NOT a member of family-1
    ]);
    prisma.transaction.findMany.mockResolvedValue([
      {
        amount: 100,
        payer: 'm1',
        splitRatio: [
          { memberId: 'm1', percentage: 50 },
        ],
        familyId,
      },
    ]);
    prisma.settlement.findMany.mockResolvedValue([]);
    await expect(service.calculatePairBalance(familyId, {
      personOneId,
      personTwoId,
      year: 2025,
      month: 6,
    })).rejects.toThrow('One or both persons have no active memberships in this family.');
  });
});