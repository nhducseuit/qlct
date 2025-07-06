import { PrismaClient, Family, Person } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export async function seedUsers(
  prisma: PrismaClient,
  families: Record<string, Family>,
  persons: Record<string, Person>,
) {
  console.log('Seeding users...');

  const hashedPassword = await bcrypt.hash('password', 10); // Simple password for dev user

  await prisma.user.upsert({
    where: { email: 'dev-user@example.com' },
    update: {
      familyId: families.myFamily.id,
    },
    create: {
      id: 'd848cfca-b85c-41cb-b9c7-d8321ff7346f',
      name: persons.duc.name,
      email: 'dev-user@example.com',
      password: hashedPassword,
      familyId: families.myFamily.id,
    },
  });

  console.log('Users seeded.');
}
