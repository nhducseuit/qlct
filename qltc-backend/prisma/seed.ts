import { PrismaClient } from '@prisma/client'; // Adjusted to be relative to the compiled location in 'dist'
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const testUserEmail = 'test@example.com';
  const testUserPassword = 'testpassword'; // Use a known password for testing

  console.log(`Checking for test user: ${testUserEmail}`);

  let user = await prisma.user.findUnique({
    where: { email: testUserEmail },
  });

  if (!user) {
    console.log(`Test user with email ${testUserEmail} not found, attempting to create...`);
    const hashedPassword = await bcrypt.hash('devpassword', 10); // Use a secure password
    user = await prisma.user.create({
      data: {
        email: testUserEmail,
        password: hashedPassword,
      },
    });
    console.log(`Created test user: ${user.email} with ID: ${user.id}`);
  } else {
    console.log(`test user ${user.email} (ID: ${user.id}) already exists.`);
  }

  // Seed PredefinedSplitRatios
  console.log('Seeding PredefinedSplitRatios...');

  const predefinedSplitRatiosData = [
    {
      id: 'b3396d63-7620-40fa-999a-5a6323069d24',
      name: 'Đức Điệp (2vc)',
      splitRatio: [
        { memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 50 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 50 },
      ],
      userId: user.id, // Link to the created/found test user
      // Let Prisma handle createdAt and updatedAt by default
    },
    {
      id: '2a1b71b6-7f26-4bfa-b7b2-9fecccee9030',
      name: 'Nhà chung (4 người)',
      splitRatio: [
        { memberId: '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44', percentage: 25 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 25 },
        { memberId: '94e6e8bf-3a8a-4234-a07c-28c54c1a06e6', percentage: 25 },
        { memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 25 },
      ].filter(item => user.id !== 'dev-user' || ['577ee6f9-283e-46c7-bbb3-9910bc70e2d5', '910b287d-d365-4daa-83d5-11c096b07068', '94e6e8bf-3a8a-4234-a07c-28c54c1a06e6', '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44'].includes(item.memberId)), // Filter out members not linked to dev user if dev user ID is hardcoded
      userId: user.id,
    },
  ];

  for (const ratioData of predefinedSplitRatiosData) {
    // The 'splitRatio' field in Prisma schema is Json.
    // Prisma Client expects an object/array for JSON fields, not a string.
    // The `ratioData.splitRatio` is already in the correct object format.
    await prisma.predefinedSplitRatio.upsert({
      where: { id: ratioData.id },
      update: {
        name: ratioData.name,
        splitRatio: ratioData.splitRatio, // This is already a JS object/array
        userId: user.id, // Ensure it's linked to the test user
        // updatedAt will be handled by Prisma
      },
      create: {
        id: ratioData.id,
        name: ratioData.name,
        splitRatio: ratioData.splitRatio,
        userId: ratioData.userId,
        // createdAt and updatedAt handled by Prisma
      },
    });
    console.log(`Upserted PredefinedSplitRatio: ${ratioData.name}`);
  }

  console.log('Finished seeding PredefinedSplitRatios.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });