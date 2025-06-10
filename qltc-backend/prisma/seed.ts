import { PrismaClient } from '../generated/prisma'; // Adjusted to be relative to the compiled location in 'dist'
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const devUserId = 'dev-user';
  const devUserEmail = 'dev@example.com';

  console.log(`Checking for dev user: ${devUserEmail} with ID: ${devUserId}`);

  let user = await prisma.user.findUnique({
    where: { id: devUserId },
  });

  if (!user) {
    console.log(`Dev user with ID ${devUserId} not found, attempting to create...`);
    const hashedPassword = await bcrypt.hash('devpassword', 10); // Use a secure password
    user = await prisma.user.create({
      data: {
        id: devUserId, // Explicitly set the ID to 'dev-user'
        email: devUserEmail,
        password: hashedPassword,
      },
    });
    console.log(`Created dev user: ${user.email} with ID: ${user.id}`);
  } else {
    console.log(`Dev user ${user.email} (ID: ${user.id}) already exists.`);
  }

  // Seed PredefinedSplitRatios
  console.log('Seeding PredefinedSplitRatios...');

  const predefinedSplitRatiosData = [
    {
      id: 'b3396d63-7620-40fa-999a-5a6323069d24',
      name: 'Chia đều 2 người',
      splitRatio: [
        { memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 50 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 50 },
      ],
      userId: devUserId,
      // Let Prisma handle createdAt and updatedAt by default
    },
    {
      id: '2a1b71b6-7f26-4bfa-b7b2-9fecccee9030',
      name: 'Chia đều 4 người',
      splitRatio: [
        { memberId: '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44', percentage: 25 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 25 },
        { memberId: '94e6e8bf-3a8a-4234-a07c-28c54c1a06e6', percentage: 25 },
        { memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 25 },
      ],
      userId: devUserId,
    },
    {
      id: '555872e7-492c-4960-b2a0-c33f518c7035',
      name: 'Chia đều 3 người',
      splitRatio: [
        { memberId: '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44', percentage: 33 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 34 },
        { memberId: '94e6e8bf-3a8a-4234-a07c-28c54c1a06e6', percentage: 33 },
      ],
      userId: devUserId,
    },
    {
      id: '5dea5798-0762-459a-bed0-9b3480286862',
      name: 'Chỉ vợ',
      splitRatio: [{ memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 100 }],
      userId: devUserId,
    },
    {
      id: 'd14c6e6a-da85-420c-b2df-470c25eb44d5',
      name: 'Chỉ chồng',
      splitRatio: [{ memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 100 }],
      userId: devUserId,
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
        userId: ratioData.userId,
        // updatedAt will be handled by Prisma
      },
      create: {
        id: ratioData.id,
        name: ratioData.name,
        splitRatio: ratioData.splitRatio,
        userId: ratioData.userId,
        // createdAt and updatedAt will be handled by Prisma
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