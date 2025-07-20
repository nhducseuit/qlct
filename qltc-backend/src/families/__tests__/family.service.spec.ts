import { Test, TestingModule } from '@nestjs/testing';
import { FamilyService } from '../family.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('FamilyService', () => {
  let service: FamilyService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      family: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FamilyService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<FamilyService>(FamilyService);
  });

  describe('getAllFamilyIds', () => {
    it('returns only family IDs where the user is a member', async () => {
      prisma.family.findMany.mockResolvedValue([
        { id: 'f1' },
        { id: 'f2' },
      ]);
      const result = await service.getAllFamilyIds('user-1');
      expect(prisma.family.findMany).toHaveBeenCalledWith({
        where: { memberships: { some: { personId: 'user-1' } } },
        select: { id: true },
      });
      expect(result).toEqual(['f1', 'f2']);
    });

    it('returns an empty array if user is not a member of any family', async () => {
      prisma.family.findMany.mockResolvedValue([]);
      const result = await service.getAllFamilyIds('user-2');
      expect(result).toEqual([]);
    });
  });
});
