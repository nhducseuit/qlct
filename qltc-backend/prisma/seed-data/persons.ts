import { PrismaClient } from '@prisma/client';

export async function seedPersons(prisma: PrismaClient) {
  console.log('Seeding persons...');

  // "My family" members
  const duc = await prisma.person.upsert({
    where: { id: 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57' },
    update: { name: 'Duc', email: 'dev-user@example.com' },
    create: {
      id: 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57',
      name: 'Duc',
      email: 'dev-user@example.com',
    },
  });

  const diep = await prisma.person.upsert({
    where: { id: '8b89ccb7-cc3e-40b5-9fba-3f680772c2c4' },
    update: { name: 'Diep' },
    create: {
      id: '8b89ccb7-cc3e-40b5-9fba-3f680772c2c4',
      name: 'Diep',
    },
  });

  // "Nhà anh chị" members
  const anh = await prisma.person.upsert({
    where: { id: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5' },
    update: { name: 'Anh' },
    create: {
      id: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5',
      name: 'Anh',
    },
  });

  const thuong = await prisma.person.upsert({
    where: { id: '910b287d-d365-4daa-83d5-11c096b07068' },
    update: { name: 'Thuong' },
    create: {
      id: '910b287d-d365-4daa-83d5-11c096b07068',
      name: 'Thuong',
    },
  });

  // Member only in "Nhà chung"
  const thao = await prisma.person.upsert({
    where: { id: '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44' },
    update: { name: 'Thao' },
    create: {
      id: '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44',
      name: 'Thao',
    },
  });

  console.log('Persons seeded.');
  return { duc, diep, anh, thuong, thao };
}
