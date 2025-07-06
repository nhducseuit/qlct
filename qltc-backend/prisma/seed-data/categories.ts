import { PrismaClient, Family, PredefinedSplitRatio, Category } from '@prisma/client';

interface FamilyMap {
  [key: string]: Family;
}

interface RatioMap {
  [key: string]: PredefinedSplitRatio;
}

export async function seedCategories(
  prisma: PrismaClient,
  families: FamilyMap,
  ratios: RatioMap,
) {
  console.log('Seeding categories...');

  const baselineCategories = [
    { id: 'f35b2279-c7d3-4ff6-b867-b79955b5227e', name: 'Nhà cửa', key: 'nhaCua', familyId: families.nhaChung.id, defaultSplitRatioId: ratios.nhaChungRatio.id },
    { id: 'cat-nha-chung-services', name: 'Dịch vụ chung', key: 'dichVuChung', familyId: families.nhaChung.id, defaultSplitRatioId: ratios.nhaChungRatio.id },
    { id: '76528a8a-a82a-4ef0-87aa-256ac621b43b', name: 'Ăn uống', key: 'anUong', familyId: families.myFamily.id, defaultSplitRatioId: ratios.myFamilyRatio.id },
    { id: '5ae9865d-4041-4612-a757-8730161071c7', name: 'Đi lại', key: 'diLai', familyId: families.myFamily.id, defaultSplitRatioId: ratios.myFamilyRatio.id },
    { id: '87ae0b88-d46d-42fe-965c-6813268e44d1', name: 'Mua sắm', key: 'muaSamDucDiep', familyId: families.myFamily.id },
    { id: '5d271e51-1c6b-4919-b76e-d7a59e719b22', name: 'Sức khỏe', key: 'sucKhoe', familyId: families.myFamily.id },
    { id: '182fe1c6-5b87-4468-93ba-159e01146b3d', name: 'Giải trí', key: 'giaiTri', familyId: families.brothersFamily.id, defaultSplitRatioId: ratios.brothersFamilyRatio.id },
    { id: '270c1489-c0a3-457d-b778-59e222880073', name: 'Học tập', key: 'hocTap', familyId: families.brothersFamily.id },
    { id: 'cat-brothers-shopping', name: 'Mua sắm', key: 'muaSamAnhThuong', familyId: families.brothersFamily.id },
    { id: '714920cc-22c9-4e14-a8cd-88d488ffeb58', name: 'Khác', key: 'khac', familyId: families.myFamily.id },
  ];

  const categoryMap: Record<string, Category> = {};

  for (const catConfig of baselineCategories) {
    const data = {
      name: catConfig.name,
      familyId: catConfig.familyId,
      key: catConfig.key, // always set the key
      ...(catConfig.defaultSplitRatioId
        ? { defaultSplitRatio: { connect: { id: catConfig.defaultSplitRatioId } } }
        : {}),
    };

    const category = await prisma.category.upsert({
      where: { id: catConfig.id },
      update: data,
      create: {
        id: catConfig.id,
        ...data,
      },
    });

    if (catConfig.key) {
      categoryMap[catConfig.key] = category;
    }
  }

  // Refetch the categories to ensure clean objects are returned
  const createdCategoryIds = Object.values(categoryMap).map(c => c.id);
  const cleanCategories = await prisma.category.findMany({
    where: {
      id: { in: createdCategoryIds },
    },
  });

  const cleanCategoryMap: Record<string, Category> = {};
  // Rebuild the map using the original keys and the clean category objects
  for (const key in categoryMap) {
    const originalCategory = categoryMap[key];
    const cleanCategory = cleanCategories.find(c => c.id === originalCategory.id);
    if (cleanCategory) {
      cleanCategoryMap[key] = cleanCategory;
    }
  }

  console.log('Categories seeded.');
  console.log('Returning clean category map:', cleanCategoryMap);
  return cleanCategoryMap;
}
