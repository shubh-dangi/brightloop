import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const permissions = [
  { key: 'org:read', name: 'View Organization', module: 'Organization' },
  { key: 'org:update', name: 'Update Organization', module: 'Organization' },
  { key: 'org:delete', name: 'Delete Organization', module: 'Organization' },
  { key: 'members:read', name: 'View Members', module: 'Members' },
  { key: 'members:invite', name: 'Invite Members', module: 'Members' },
  { key: 'members:update', name: 'Update Member Roles', module: 'Members' },
  { key: 'members:remove', name: 'Remove Members', module: 'Members' },
  { key: 'roles:manage', name: 'Manage Roles & Permissions', module: 'Roles' },
  { key: 'records:read', name: 'View Records & Subscriptions', module: 'Records' },
  { key: 'records:create', name: 'Create Records & Subscriptions', module: 'Records' },
  { key: 'records:update', name: 'Update Records & Subscriptions', module: 'Records' },
  { key: 'records:delete', name: 'Delete Records & Subscriptions', module: 'Records' },
  { key: 'settings:update', name: 'Update System Settings', module: 'Settings' },
  { key: 'audit:read', name: 'View Activity Audit Logs', module: 'Audit' },
];

async function main() {
  console.log('🌱 Starting Subpulse database seed...');

  // 1. Seed Permissions
  console.log('Inserting system permissions...');
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      create: perm,
      update: perm,
    });
  }

  const allPerms = await prisma.permission.findMany();

  // 2. Seed Default Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'subpulse-primary-workspace' },
    create: {
      name: 'Subpulse Primary Workspace',
      slug: 'subpulse-primary-workspace',
      settings: {
        create: {
          displayName: 'Subpulse Workspace',
          supportEmail: 'support@subpulse.local',
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          allowMemberInvites: true,
          enforce2FA: false,
        },
      },
    },
    update: {},
  });

  // 3. Seed Roles for Workspace
  const ownerRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'OWNER' } },
    create: {
      organizationId: org.id,
      name: 'OWNER',
      description: 'Full workspace ownership, billing, and system governance',
      isSystem: true,
    },
    update: {},
  });

  const adminRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'ADMIN' } },
    create: {
      organizationId: org.id,
      name: 'ADMIN',
      description: 'Administrative access over members, invoices, and plans',
      isSystem: true,
    },
    update: {},
  });

  const memberRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'MEMBER' } },
    create: {
      organizationId: org.id,
      name: 'MEMBER',
      description: 'Internal operations staff with subscription and invoice management',
      isSystem: true,
    },
    update: {},
  });

  const viewerRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'VIEWER' } },
    create: {
      organizationId: org.id,
      name: 'VIEWER',
      description: 'Read-only access across workspace records',
      isSystem: true,
    },
    update: {},
  });

  // Attach permissions to roles
  for (const p of allPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: ownerRole.id, permissionId: p.id },
      },
      create: { roleId: ownerRole.id, permissionId: p.id },
      update: {},
    });

    if (p.key !== 'org:delete') {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: adminRole.id, permissionId: p.id },
        },
        create: { roleId: adminRole.id, permissionId: p.id },
        update: {},
      });
    }

    if (
      p.key.startsWith('records:') ||
      p.key === 'members:read' ||
      p.key === 'audit:read' ||
      p.key === 'org:read'
    ) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: memberRole.id, permissionId: p.id },
        },
        create: { roleId: memberRole.id, permissionId: p.id },
        update: {},
      });
    }

    if (p.key.endsWith(':read')) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: viewerRole.id, permissionId: p.id },
        },
        create: { roleId: viewerRole.id, permissionId: p.id },
        update: {},
      });
    }
  }

  // 4. Seed Demo Users with Argon2id
  const passwordHash = await argon2.hash('Password123!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
  });

  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@subpulse.local' },
    create: {
      name: 'Taylor Reed (Owner)',
      email: 'owner@subpulse.local',
      passwordHash,
      isEmailVerified: true,
      userPreference: {
        create: {
          theme: 'system',
          accentColor: 'indigo',
          density: 'comfortable',
        },
      },
    },
    update: {},
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@subpulse.local' },
    create: {
      name: 'Morgan Blake (Admin)',
      email: 'admin@subpulse.local',
      passwordHash,
      isEmailVerified: true,
      userPreference: {
        create: {
          theme: 'dark',
          accentColor: 'emerald',
          density: 'comfortable',
        },
      },
    },
    update: {},
  });

  const memberUser = await prisma.user.upsert({
    where: { email: 'member@subpulse.local' },
    create: {
      name: 'Jordan Hayes (Staff)',
      email: 'member@subpulse.local',
      passwordHash,
      isEmailVerified: true,
      userPreference: {
        create: {
          theme: 'light',
          accentColor: 'blue',
          density: 'compact',
        },
      },
    },
    update: {},
  });

  // Assign memberships
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: { organizationId: org.id, userId: ownerUser.id },
    },
    create: {
      organizationId: org.id,
      userId: ownerUser.id,
      roleId: ownerRole.id,
      status: 'ACTIVE',
    },
    update: {},
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: { organizationId: org.id, userId: adminUser.id },
    },
    create: {
      organizationId: org.id,
      userId: adminUser.id,
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
    update: {},
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: { organizationId: org.id, userId: memberUser.id },
    },
    create: {
      organizationId: org.id,
      userId: memberUser.id,
      roleId: memberRole.id,
      status: 'ACTIVE',
    },
    update: {},
  });

  // 5. Seed Demo Subscription & Billing Records
  const demoRecords = [
    {
      title: 'Enterprise Platform Plan - Tier 3',
      description: 'Annual recurring subscription contract with dedicated infrastructure and priority SLA.',
      status: 'ACTIVE' as const,
      priority: 'CRITICAL' as const,
      category: 'Subscription Plans',
      tags: ['annual', 'enterprise', 'sla'],
      metadata: { mrrContribution: 4500, billingAnchorDay: 1, seatsAllocated: 150 },
      createdById: ownerUser.id,
    },
    {
      title: 'Tax Exemption Compliance Filing - NY',
      description: 'State resale tax exemption certificate verification for enterprise accounts.',
      status: 'ACTIVE' as const,
      priority: 'HIGH' as const,
      category: 'Taxes',
      tags: ['tax', 'compliance', 'ny'],
      metadata: { jurisdiction: 'US-NY', exemptStatus: 'Verified' },
      createdById: adminUser.id,
    },
    {
      title: 'Realtime Usage Webhook Ingress',
      description: 'Automated meter event collector recording hourly API consumption for metered add-ons.',
      status: 'ACTIVE' as const,
      priority: 'MEDIUM' as const,
      category: 'Metering',
      tags: ['webhooks', 'metering'],
      metadata: { batchWindow: '60s', sampleRate: '100%' },
      createdById: memberUser.id,
    },
    {
      title: 'Early Adopter Promotional Discount (20%)',
      description: 'Recurring coupon applied to first 12 billing cycles for Q1 cohorts.',
      status: 'DRAFT' as const,
      priority: 'LOW' as const,
      category: 'Discounts',
      tags: ['promo', 'discount', 'q1'],
      metadata: { discountPercent: 20, maxRedemptions: 50 },
      createdById: adminUser.id,
    },
  ];

  for (const rec of demoRecords) {
    const existing = await prisma.genericRecord.findFirst({
      where: { organizationId: org.id, title: rec.title },
    });
    if (!existing) {
      await prisma.genericRecord.create({
        data: {
          ...rec,
          organizationId: org.id,
        },
      });
    }
  }

  // 6. Seed Demo Notifications
  const demoNotifications = [
    {
      title: 'Subpulse Platform Initialized',
      message: 'Workspace configured with enterprise RBAC roles and subscription billing architecture.',
      type: 'SUCCESS' as const,
      isRead: true,
    },
    {
      title: 'Recurring Billing Cycle Verified',
      message: 'Scheduled billing run processed 24 active renewals with zero proration errors.',
      type: 'INFO' as const,
      isRead: false,
    },
    {
      title: 'Security Alert: New Sign-in',
      message: 'Session verified via Argon2id authentication from Taylor Reed.',
      type: 'SECURITY' as const,
      isRead: false,
    },
  ];

  for (const notif of demoNotifications) {
    await prisma.notification.create({
      data: {
        ...notif,
        organizationId: org.id,
        userId: ownerUser.id,
      },
    });
  }

  console.log('✅ Subpulse database seed completed successfully!');
  console.log('==============================================');
  console.log('Default Demo Accounts:');
  console.log('Owner:  owner@subpulse.local  | Password123!');
  console.log('Admin:  admin@subpulse.local  | Password123!');
  console.log('Staff:  member@subpulse.local | Password123!');
  console.log('==============================================');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
