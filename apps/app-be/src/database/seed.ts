import prisma from './client';
import { hashPassword } from '../utils/auth';
import { UserRole, UserStatus } from '@app/shared-types';

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create users
  console.log('👤 Creating users...');
  const hashedPassword = await hashPassword('Password123');

  // Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'super.admin@example.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  // Manager
  const manager = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Manager',
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  // Regular Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'user1@example.com',
        password: hashedPassword,
        firstName: 'Alice',
        lastName: 'Johnson',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'user2@example.com',
        password: hashedPassword,
        firstName: 'Bob',
        lastName: 'Smith',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'user3@example.com',
        password: hashedPassword,
        firstName: 'Carol',
        lastName: 'Williams',
        role: UserRole.USER,
        status: UserStatus.PENDING_VERIFICATION,
      },
    }),
  ]);

  // Create some audit logs
  console.log('📝 Creating audit logs...');
  await Promise.all([
    prisma.auditLog.create({
      data: {
        userId: superAdmin.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: superAdmin.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: manager.id,
        action: 'CREATE',
        entity: 'User',
        entityId: users[0].id,
        changes: JSON.stringify({
          created: {
            email: users[0].email,
            firstName: users[0].firstName,
            lastName: users[0].lastName,
            role: users[0].role,
          },
        }),
      },
    }),
  ]);

  console.log('✅ Seed completed successfully!');

  console.log('\n📊 Created:');
  console.log('- 1 Super Admin');
  console.log('- 1 Manager');
  console.log('- 3 Regular Users');
  console.log('- 2 Audit logs');

  console.log('\n🔑 Login credentials:');
  console.log('Super Admin: super.admin@example.com / Password123');
  console.log('Manager: manager@example.com / Password123');
  console.log('User 1: user1@example.com / Password123');
  console.log('User 2: user2@example.com / Password123');
  console.log('User 3: user3@example.com / Password123 (pending verification)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
