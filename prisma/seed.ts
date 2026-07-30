import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Running database seed script...');

  const superAdminName = process.env.SUPER_ADMIN_NAME?.trim() || 'Platform Super Admin';
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim() || 'admin@sit.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD?.trim() || 'Admin123!';

  // 1. Idempotent Platform Super Admin creation
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdmin) {
    const passwordHash = await bcrypt.hash(superAdminPassword, 10);
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
    // Ensure role is PLATFORM_SUPER_ADMIN
    await prisma.user.update({
      where: { email: superAdminEmail },
      data: { role: 'PLATFORM_SUPER_ADMIN', active: true },
    });
    console.log(`ℹ️ Updated Platform Super Admin account: ${superAdminEmail}`);
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
