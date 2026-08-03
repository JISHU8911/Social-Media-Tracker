import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Running database seed script...');

  const superAdminName = process.env.SUPER_ADMIN_NAME?.trim() || 'JISHU DAS';
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL?.trim() || 'dass456890@gmail.com').toLowerCase();
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD?.trim() || '123456789';

  const passwordHash = await bcrypt.hash(superAdminPassword, 10);

  // Clean up any duplicate Super Admin accounts if multiple exist
  const existingUsers = await prisma.user.findMany({
    where: { email: superAdminEmail },
  });

  if (existingUsers.length > 1) {
    console.log(`⚠️ Found ${existingUsers.length} duplicate user records for ${superAdminEmail}. Cleaning up duplicates...`);
    const primaryId = existingUsers[0].id;
    const duplicateIds = existingUsers.slice(1).map((u) => u.id);
    await prisma.user.deleteMany({
      where: { id: { in: duplicateIds } },
    });
  }

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdmin) {
    await prisma.user.create({
      data: {
        name: superAdminName,
        email: superAdminEmail,
        passwordHash,
        role: 'PLATFORM_SUPER_ADMIN',
        active: true,
      },
    });
    console.log(`✅ Successfully created Platform Super Admin: ${superAdminEmail}`);
  } else {
    // Idempotently update role, name, active status, and passwordHash
    await prisma.user.update({
      where: { email: superAdminEmail },
      data: {
        name: superAdminName,
        role: 'PLATFORM_SUPER_ADMIN',
        active: true,
        passwordHash,
      },
    });
    console.log(`ℹ️ Successfully updated Platform Super Admin passwordHash & role for: ${superAdminEmail}`);
  }

  console.log('✅ Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
