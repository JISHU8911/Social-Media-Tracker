import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Running production database seed script...');

  const superAdminName = process.env.SUPER_ADMIN_NAME?.trim();
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim();
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD?.trim();

  // Strict Environment Variable Validation (No Fallbacks Allowed)
  const missingVars: string[] = [];
  if (!superAdminName) missingVars.push('SUPER_ADMIN_NAME');
  if (!superAdminEmail) missingVars.push('SUPER_ADMIN_EMAIL');
  if (!superAdminPassword) missingVars.push('SUPER_ADMIN_PASSWORD');

  if (missingVars.length > 0) {
    console.error(
      `\n❌ SEEDING HALTED: The following required environment variables are missing:\n - ${missingVars.join(
        '\n - '
      )}\n\nPlease define all Super Admin credentials in your environment variables (.env / Vercel Environment Variables) before running the seed script.\n`
    );
    process.exit(1);
  }

  // 1. Idempotent Super Admin creation/check
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
        role: 'SUPER_ADMIN',
        active: true,
      },
    });
    console.log(`✅ Successfully created Super Admin: ${superAdminEmail}`);
  } else {
    console.log(`ℹ️ Super Admin account already exists: ${superAdminEmail}`);
  }

  // 2. Idempotent Designation seeding
  const defaultDesignations = [
    'MANAGER',
    'EXECUTIVE',
    'TEAM LEAD',
    'ASSISTANT MANAGER',
    'DIRECTOR',
  ];

  for (const name of defaultDesignations) {
    await prisma.designation.upsert({
      where: { designationName: name },
      update: {},
      create: {
        designationName: name,
        active: true,
      },
    });
  }

  console.log('✅ Database seeding completed successfully. State is 100% idempotent.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
