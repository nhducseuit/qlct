import { PrismaClient } from '@prisma/client';

export async function seedFamilies(prisma: PrismaClient) {
  console.log('Seeding families...');
  const nhaChung = await prisma.family.upsert({
    where: { id: 'big-family-1' },
    update: { name: 'Nhà chung' },
    create: { id: 'big-family-1', name: 'Nhà chung' },
  });

  const myFamily = await prisma.family.upsert({
    where: { id: 'small-family-1' },
    update: { name: 'My family', parentId: nhaChung.id },
    create: { id: 'small-family-1', name: 'My family', parentId: nhaChung.id },
  });

  const brothersFamily = await prisma.family.upsert({
    where: { id: 'small-family-2' },
    update: { name: 'Nhà anh chị', parentId: nhaChung.id },
    create: {
      id: 'small-family-2',
      name: 'Nhà anh chị',
      parentId: nhaChung.id,
    },
  });
  console.log('Families seeded.');
  return { nhaChung, myFamily, brothersFamily };
}
