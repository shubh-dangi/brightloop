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
  { key: 'records:read', name: 'View Records', module: 'Records' },
  { key: 'records:create', name: 'Create Records', module: 'Records' },
  { key: 'records:update', name: 'Update Records', module: 'Records' },
  { key: 'records:delete', name: 'Delete Records', module: 'Records' },
  { key: 'settings:update', name: 'Update System Settings', module: 'Settings' },
  { key: 'audit:read', name: 'View Activity Audit Logs', module: 'Audit' },
];

async function main() {
  console.log('🌱 Starting UNKNOWN database seed...');

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
    where: { slug: 'unknown-default-workspace' },
    create: {
      name: 'UNKNOWN Default Workspace',
      slug: 'unknown-default-workspace',
      settings: {
        create: {
          displayName: 'UNKNOWN Workspace',
          supportEmail: 'support@unknown.local',
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
      description: 'Full workspace ownership and control',
      isSystem: true,
    },
    update: {},
  });

  const adminRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'ADMIN' } },
    create: {
      organizationId: org.id,
      name: 'ADMIN',
      description: 'Administrative access over members and records',
      isSystem: true,
    },
    update: {},
  });

  const memberRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'MEMBER' } },
    create: {
      organizationId: org.id,
      name: 'MEMBER',
      description: 'Standard member with record creation and editing rights',
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

    // Admin gets everything except org:delete
    if (p.key !== 'org:delete') {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: adminRole.id, permissionId: p.id },
        },
        create: { roleId: adminRole.id, permissionId: p.id },
        update: {},
      });
    }

    // Member gets records:* and members:read and audit:read
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

    // Viewer gets *:read only
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

  // 4. Seed Demo Users
  const passwordHash = await argon2.hash('Password123!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
  });

  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@unknown.local' },
    create: {
      name: 'Taylor Reed (Owner)',
      email: 'owner@unknown.local',
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
    where: { email: 'admin@unknown.local' },
    create: {
      name: 'Morgan Blake (Admin)',
      email: 'admin@unknown.local',
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
    where: { email: 'member@unknown.local' },
    create: {
      name: 'Jordan Hayes (Member)',
      email: 'member@unknown.local',
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

  // 5. Seed Demo GenericRecords
  const demoRecords = [
    {
      title: 'Infrastructure Ingestion Gateway',
      description: 'Primary ingress pipeline processing multi-region webhook payloads.',
      status: 'ACTIVE' as const,
      priority: 'CRITICAL' as const,
      category: 'Infrastructure',
      tags: ['network', 'gateway', 'core'],
      metadata: { version: '2.4.0', cluster: 'us-east-1' },
      createdById: ownerUser.id,
    },
    {
      title: 'Audit Log Retention Policy',
      description: 'Quarterly compliance policy enforcing cryptographic storage archival.',
      status: 'ACTIVE' as const,
      priority: 'HIGH' as const,
      category: 'Compliance',
      tags: ['security', 'soc2', 'audit'],
      metadata: { retentionDays: 365 },
      createdById: adminUser.id,
    },
    {
      title: 'Realtime Telemetry Collector',
      description: 'Aggregates metrics and CPU usage metrics across worker nodes.',
      status: 'ACTIVE' as const,
      priority: 'MEDIUM' as const,
      category: 'Analytics',
      tags: ['telemetry', 'monitoring'],
      metadata: { sampleRate: '10s' },
      createdById: memberUser.id,
    },
    {
      title: 'Legacy Export Migration Spec',
      description: 'Specification draft for deprecating old CSV batch pipelines.',
      status: 'DRAFT' as const,
      priority: 'LOW' as const,
      category: 'Operations',
      tags: ['migration', 'draft'],
      metadata: { targetQuarter: 'Q4' },
      createdById: adminUser.id,
    },
    {
      title: 'Customer Encryption Key Rotation',
      description: 'Scheduled annual rotation for tenant cryptographic keys.',
      status: 'ACTIVE' as const,
      priority: 'HIGH' as const,
      category: 'Security',
      tags: ['kms', 'crypto'],
      metadata: { algorithm: 'AES-256-GCM' },
      createdById: ownerUser.id,
    },
    {
      title: 'Deprecated V1 API Webhook Sync',
      description: 'Historical sync record kept for archival and rollback purposes.',
      status: 'ARCHIVED' as const,
      priority: 'LOW' as const,
      category: 'Operations',
      tags: ['deprecated', 'v1'],
      metadata: { deprecatedAt: '2025-12-31' },
      createdById: memberUser.id,
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
      title: 'Workspace Initialized',
      message: 'UNKNOWN SaaS workspace configured with default enterprise RBAC roles.',
      type: 'SUCCESS' as const,
      isRead: true,
    },
    {
      title: 'Security Notice',
      message: 'New login detected from IP 192.168.1.1 (Taylor Reed).',
      type: 'SECURITY' as const,
      isRead: false,
    },
    {
      title: 'System Health Check',
      message: 'All worker nodes and database replicas are healthy and responsive.',
      type: 'INFO' as const,
      isRead: false,
    },
    {
      title: 'Storage Threshold Alert',
      message: 'Workspace object storage passed 65% of allocated quota.',
      type: 'WARNING' as const,
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

  // 7. Seed Demo Activity Logs
  const demoLogs = [
    {
      action: 'workspace:initialized',
      entity: 'Organization',
      entityId: org.id,
      userId: ownerUser.id,
      details: { workspace: org.name },
    },
    {
      action: 'member:joined',
      entity: 'OrganizationMember',
      entityId: adminUser.id,
      userId: adminUser.id,
      details: { role: 'ADMIN' },
    },
    {
      action: 'record:created',
      entity: 'GenericRecord',
      entityId: 'rec-1',
      userId: ownerUser.id,
      details: { title: 'Infrastructure Ingestion Gateway' },
    },
  ];

  for (const log of demoLogs) {
    await prisma.activityLog.create({
      data: {
        ...log,
        organizationId: org.id,
      },
    });
  }

  console.log('✅ Database seed completed successfully!');
  console.log('==============================================');
  console.log('Default Credentials:');
  console.log('Owner:  owner@unknown.local  | Password123!');
  console.log('Admin:  admin@unknown.local  | Password123!');
  console.log('Member: member@unknown.local | Password123!');
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
