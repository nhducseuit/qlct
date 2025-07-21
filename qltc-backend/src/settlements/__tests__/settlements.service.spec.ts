import { Test, TestingModule } from '@nestjs/testing';
import { SettlementsService } from '../settlements.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FamilyService } from '../../families/family.service';
import { NotificationsGateway } from '../../notifications/notifications.gateway';

describe('SettlementsService - calculatePairBalance (global, cross-family)', () => {
  it('correctly calculates net balance for real-world asymmetric shared expenses (Duc/Thao)', async () => {
    // Setup: Duc and Thao are both in big-family-1
    const personOneId = 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57'; // Duc
    const personTwoId = '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44'; // Thao
    const familyId = 'big-family-1';
    familyService.getAllFamilyIds.mockResolvedValue([familyId]);
    prisma.householdMembership.findMany.mockResolvedValue([
      { id: 'membership-duc-nha-chung', personId: personOneId, familyId, isActive: true, person: { name: 'Duc' } },
      { id: 'membership-thao-nha-chung', personId: personTwoId, familyId, isActive: true, person: { name: 'Thao' } },
    ]);
    prisma.transaction.findMany.mockResolvedValue([
      // Duc paid 1,000,000 for 5 people, Thao's share 20%
      {
        amount: 1000000,
        payer: 'membership-duc-nha-chung',
        splitRatio: [
          { memberId: 'membership-duc-nha-chung', percentage: 20 },
          { memberId: 'membership-diep-nha-chung', percentage: 20 },
          { memberId: 'membership-anh-nha-chung', percentage: 20 },
          { memberId: 'membership-thuong-nha-chung', percentage: 20 },
          { memberId: 'membership-thao-nha-chung', percentage: 20 },
        ],
        familyId,
        date: new Date('2025-07-15T10:00:00.000Z'),
      },
      // Duc paid 11,111,111 for 5 people, Thao's share 20%
      {
        amount: 11111111,
        payer: 'membership-duc-nha-chung',
        splitRatio: [
          { memberId: 'membership-duc-nha-chung', percentage: 20 },
          { memberId: 'membership-diep-nha-chung', percentage: 20 },
          { memberId: 'membership-anh-nha-chung', percentage: 20 },
          { memberId: 'membership-thuong-nha-chung', percentage: 20 },
          { memberId: 'membership-thao-nha-chung', percentage: 20 },
        ],
        familyId,
        date: new Date('2025-06-01T17:00:00.000Z'),
      },
    ]);
    prisma.settlement.findMany.mockResolvedValue([]); // No settlements

    const result = await service.calculatePairBalance(undefined, {
      personOneId,
      personTwoId,
      year: 2025,
      month: 7,
    });

    // Manual calculation:
    // Transaction 1: Thao owes Duc 200,000
    // Transaction 2: Thao owes Duc 2,222,222.2
    // Net: Thao owes Duc 2,422,222.2 (should be negative, since personTwo owes personOne)
    expect(result.balances.length).toBe(1);
    expect(result.balances[0].personOneId).toBe(personOneId);
    expect(result.balances[0].personTwoId).toBe(personTwoId);
    expect(result.balances[0].netAmountPersonOneOwesPersonTwo).toBeCloseTo(-2422222.2, 1); // negative: Thao owes Duc
  });

  it('correctly calculates net balance for real-world asymmetric shared expenses (Duc/Thao)', async () => {
    // Setup: Duc and Thao are both in big-family-1
    const personOneId = 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57'; // Duc
    const personTwoId = '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44'; // Thao
    const familyId = 'big-family-1';
    familyService.getAllFamilyIds.mockResolvedValue([familyId]);
    prisma.householdMembership.findMany.mockResolvedValue([
      { id: 'membership-duc-nha-chung', personId: personOneId, familyId, isActive: true, person: { name: 'Duc' } },
      { id: 'membership-thao-nha-chung', personId: personTwoId, familyId, isActive: true, person: { name: 'Thao' } },
    ]);
    prisma.transaction.findMany.mockResolvedValue([
      // Duc paid 1,000,000 for 5 people, Thao's share 20%
      {
        amount: 1000000,
        payer: 'membership-duc-nha-chung',
        splitRatio: [
          { memberId: 'membership-duc-nha-chung', percentage: 20 },
          { memberId: 'membership-diep-nha-chung', percentage: 20 },
          { memberId: 'membership-anh-nha-chung', percentage: 20 },
          { memberId: 'membership-thuong-nha-chung', percentage: 20 },
          { memberId: 'membership-thao-nha-chung', percentage: 20 },
        ],
        familyId,
        date: new Date('2025-07-15T10:00:00.000Z'),
      },
      // Duc paid 11,111,111 for 5 people, Thao's share 20%
      {
        amount: 11111111,
        payer: 'membership-duc-nha-chung',
        splitRatio: [
          { memberId: 'membership-duc-nha-chung', percentage: 20 },
          { memberId: 'membership-diep-nha-chung', percentage: 20 },
          { memberId: 'membership-anh-nha-chung', percentage: 20 },
          { memberId: 'membership-thuong-nha-chung', percentage: 20 },
          { memberId: 'membership-thao-nha-chung', percentage: 20 },
        ],
        familyId,
        date: new Date('2025-06-01T17:00:00.000Z'),
      },
    ]);
    prisma.settlement.findMany.mockResolvedValue([]); // No settlements

    const result = await service.calculatePairBalance(undefined, {
      personOneId,
      personTwoId,
      year: 2025,
      month: 7,
    });

    // Manual calculation:
    // Transaction 1: Thao owes Duc 200,000
    // Transaction 2: Thao owes Duc 2,222,222.2
    // Net: Thao owes Duc 2,422,222.2 (should be negative, since personTwo owes personOne)
    expect(result.balances.length).toBe(1);
    expect(result.balances[0].personOneId).toBe(personOneId);
    expect(result.balances[0].personTwoId).toBe(personTwoId);
    expect(result.balances[0].netAmountPersonOneOwesPersonTwo).toBeCloseTo(-2422222.2, 1); // negative: Thao owes Duc
  });
  it('returns cumulative balance up to (including) the given month/year, not just within that month/year', async () => {
    // Setup: p1, p2 in same family, multiple transactions/settlements across months
    const personOneId = 'p1';
    const personTwoId = 'p2';
    const familyId = 'family-1';
    familyService.getAllFamilyIds.mockResolvedValue([familyId]);
    prisma.householdMembership.findMany.mockResolvedValue([
      { id: 'm1', personId: personOneId, familyId, isActive: true, person: { name: 'A' } },
      { id: 'm2', personId: personTwoId, familyId, isActive: true, person: { name: 'B' } },
    ]);
    // Transactions: 1 in 2025-05, 1 in 2025-06, 1 in 2025-07
    prisma.transaction.findMany.mockResolvedValue([
      {
        amount: 100,
        payer: 'm1',
        splitRatio: [
          { memberId: 'm1', percentage: 50 },
          { memberId: 'm2', percentage: 50 },
        ],
        familyId,
        date: new Date('2025-05-10'),
      },
      {
        amount: 200,
        payer: 'm2',
        splitRatio: [
          { memberId: 'm1', percentage: 50 },
          { memberId: 'm2', percentage: 50 },
        ],
        familyId,
        date: new Date('2025-06-15'),
      },
      {
        amount: 300,
        payer: 'm1',
        splitRatio: [
          { memberId: 'm1', percentage: 50 },
          { memberId: 'm2', percentage: 50 },
        ],
        familyId,
        date: new Date('2025-07-20'),
      },
    ]);
    // Settlements: 50 in 2025-05, 30 in 2025-07
    prisma.settlement.findMany.mockResolvedValue([
      { payerId: personOneId, payeeId: personTwoId, amount: 50, date: new Date('2025-05-20') },
      { payerId: personTwoId, payeeId: personOneId, amount: 30, date: new Date('2025-07-25') },
    ]);
    // Query for 2025-06 (should include 05 and 06, not 07)
    const result = await service.calculatePairBalance(undefined, {
      personOneId,
      personTwoId,
      year: 2025,
      month: 6,
    });
    // Calculation:
    // 2025-05: p1 pays 100, split 50/50 => p2 owes p1 50
    // 2025-06: p2 pays 200, split 50/50 => p1 owes p2 100
    // 2025-07: ignored (after month)
    // Settlements: p1->p2 50 (in 05), p2->p1 30 (in 07, ignored)
    // Net: (p2 owes p1 50) - (p1 owes p2 100) - 50 = -100
    // Expect: netAmountPersonOneOwesPersonTwo = 100 (p1 owes p2)
    expect(result.balances.length).toBe(1);
    expect(result.balances[0].personOneId).toBe(personOneId);
    expect(result.balances[0].personTwoId).toBe(personTwoId);
    expect(result.balances[0].netAmountPersonOneOwesPersonTwo).toBeCloseTo(0, 1);
  });
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
    expect(result.balances[0].netAmountPersonOneOwesPersonTwo).toBeCloseTo(28, 1); // positive: personOne owes personTwo (sign convention enforced July 2025)
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
    expect(result.balances[0].netAmountPersonOneOwesPersonTwo).toBeCloseTo(-30, 1);
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