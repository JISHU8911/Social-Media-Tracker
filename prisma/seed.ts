import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Running database seed script...');

  const superAdminName = process.env.SUPER_ADMIN_NAME?.trim() || 'Platform Super Admin';
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim() || 'admin@sit.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD?.trim() || 'Admin123!';

  // 1. Idempotent Platform Super Admin creation & password sync
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  const passwordHash = await bcrypt.hash(superAdminPassword, 10);

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
    // Ensure role is PLATFORM_SUPER_ADMIN and update password hash to match environment variable
    await prisma.user.update({
      where: { email: superAdminEmail },
      data: {
        name: superAdminName,
        role: 'PLATFORM_SUPER_ADMIN',
        active: true,
        passwordHash,
      },
    });
    console.log(`ℹ️ Successfully updated Platform Super Admin password & role: ${superAdminEmail}`);
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
