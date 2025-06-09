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
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });