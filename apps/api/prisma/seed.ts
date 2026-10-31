import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const permissions = [
  // Org
  { key: 'org:read', name: 'View Organization', module: 'Organization' },
  { key: 'org:update', name: 'Update Organization', module: 'Organization' },
  { key: 'org:delete', name: 'Delete Organization', module: 'Organization' },
  // Members
  { key: 'members:read', name: 'View Members', module: 'Members' },
  { key: 'members:invite', name: 'Invite Members', module: 'Members' },
  { key: 'members:update', name: 'Update Member Roles', module: 'Members' },
  { key: 'members:remove', name: 'Remove Members', module: 'Members' },
  // Roles
  { key: 'roles:manage', name: 'Manage Roles & Permissions', module: 'Roles' },
  // Generic Records
  { key: 'records:read', name: 'View Records', module: 'Records' },
  { key: 'records:create', name: 'Create Records', module: 'Records' },
  { key: 'records:update', name: 'Update Records', module: 'Records' },
  { key: 'records:delete', name: 'Delete Records', module: 'Records' },
  // System & Audit
  { key: 'settings:update', name: 'Update System Settings', module: 'Settings' },
  { key: 'audit:read', name: 'View Activity Audit Logs', module: 'Audit' },

  // Domain Permissions - Customers
  { key: 'customers:read', name: 'View Customers', module: 'Customers' },
  { key: 'customers:create', name: 'Create Customer', module: 'Customers' },
  { key: 'customers:update', name: 'Update Customer', module: 'Customers' },
  { key: 'customers:delete', name: 'Delete Customer', module: 'Customers' },

  // Products & Variants
  { key: 'products:read', name: 'View Products & Variants', module: 'Products' },
  { key: 'products:create', name: 'Create Products', module: 'Products' },
  { key: 'products:update', name: 'Update Products', module: 'Products' },
  { key: 'products:delete', name: 'Delete Products', module: 'Products' },

  // Plans
  { key: 'plans:read', name: 'View Subscription Plans', module: 'Plans' },
  { key: 'plans:create', name: 'Create Subscription Plans', module: 'Plans' },
  { key: 'plans:update', name: 'Update Subscription Plans', module: 'Plans' },
  { key: 'plans:delete', name: 'Delete Subscription Plans', module: 'Plans' },

  // Quotations
  { key: 'quotations:read', name: 'View Quotations', module: 'Quotations' },
  { key: 'quotations:create', name: 'Create Quotation', module: 'Quotations' },
  { key: 'quotations:update', name: 'Update Quotation', module: 'Quotations' },
  { key: 'quotations:confirm', name: 'Confirm Quotation', module: 'Quotations' },
  { key: 'quotations:cancel', name: 'Cancel Quotation', module: 'Quotations' },

  // Subscriptions
  { key: 'subscriptions:read', name: 'View Subscriptions', module: 'Subscriptions' },
  { key: 'subscriptions:create', name: 'Create Subscription', module: 'Subscriptions' },
  { key: 'subscriptions:update', name: 'Update Subscription', module: 'Subscriptions' },
  { key: 'subscriptions:pause', name: 'Pause Subscription', module: 'Subscriptions' },
  { key: 'subscriptions:close', name: 'Close Subscription', module: 'Subscriptions' },
  { key: 'subscriptions:renew', name: 'Renew Subscription', module: 'Subscriptions' },

  // Invoices
  { key: 'invoices:read', name: 'View Invoices', module: 'Invoices' },
  { key: 'invoices:confirm', name: 'Confirm Invoice', module: 'Invoices' },
  { key: 'invoices:cancel', name: 'Cancel Invoice', module: 'Invoices' },
  { key: 'invoices:send', name: 'Send / Print Invoice', module: 'Invoices' },

  // Taxes & Discounts
  { key: 'taxes:manage', name: 'Configure Taxes', module: 'Taxes' },
  { key: 'discounts:read', name: 'View Discounts', module: 'Discounts' },
  { key: 'discounts:manage', name: 'Create & Edit Discounts', module: 'Discounts' },
  { key: 'discounts:apply', name: 'Apply Discounts', module: 'Discounts' },

  // Payments
  { key: 'payments:read', name: 'View Payments', module: 'Payments' },
  { key: 'payments:record', name: 'Record Payment', module: 'Payments' },

  // Reports
  { key: 'reports:operational', name: 'View Operational Reports', module: 'Reports' },
  { key: 'reports:financial', name: 'View Executive Financial Reports', module: 'Reports' },
];

async function main() {
  console.log('🌱 Starting Brightloop database seed...');

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
    where: { slug: 'brightloop-primary-workspace' },
    create: {
      name: 'Brightloop Primary Workspace',
      slug: 'brightloop-primary-workspace',
      settings: {
        create: {
          displayName: 'Brightloop Workspace',
          supportEmail: 'support@brightloop.local',
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

  const customerRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'CUSTOMER' } },
    create: {
      organizationId: org.id,
      name: 'CUSTOMER',
      description: 'Customer portal access for subscriptions, invoices, and payments',
      isSystem: true,
    },
    update: {},
  });

  const customerAllowedPermissions = [
    'customers:read',
    'subscriptions:read',
    'invoices:read',
    'quotations:read',
    'payments:read',
    'plans:read',
    'products:read',
    'discounts:read',
  ];

  // Permissions for Staff (MEMBER)
  const staffAllowedPrefixes = [
    'customers:read',
    'customers:create',
    'customers:update',
    'products:read',
    'plans:read',
    'quotations:read',
    'quotations:create',
    'quotations:update',
    'quotations:confirm',
    'quotations:cancel',
    'subscriptions:read',
    'subscriptions:create',
    'subscriptions:update',
    'subscriptions:pause',
    'subscriptions:close',
    'subscriptions:renew',
    'invoices:read',
    'invoices:confirm',
    'invoices:cancel',
    'invoices:send',
    'discounts:read',
    'discounts:apply',
    'payments:read',
    'payments:record',
    'reports:operational',
    'members:read',
    'audit:read',
    'org:read',
    'records:read',
    'records:create',
    'records:update',
  ];

  // Attach permissions to roles
  for (const p of allPerms) {
    // Owner gets everything
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

    // Staff (MEMBER) gets operational permissions
    if (staffAllowedPrefixes.includes(p.key)) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: memberRole.id, permissionId: p.id },
        },
        create: { roleId: memberRole.id, permissionId: p.id },
        update: {},
      });
    }

    // Viewer gets all read permissions
    if (p.key.endsWith(':read')) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: viewerRole.id, permissionId: p.id },
        },
        create: { roleId: viewerRole.id, permissionId: p.id },
        update: {},
      });
    }

    // Customer gets portal-specific read permissions
    if (customerAllowedPermissions.includes(p.key)) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: customerRole.id, permissionId: p.id },
        },
        create: { roleId: customerRole.id, permissionId: p.id },
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
    where: { email: 'owner@brightloop.local' },
    create: {
      name: 'Taylor Reed (Owner)',
      email: 'owner@brightloop.local',
      passwordHash,
      isEmailVerified: true,
      userPreference: {
        create: {
          theme: 'dark',
          accentColor: 'indigo',
          density: 'comfortable',
        },
      },
      memberships: {
        create: {
          organizationId: org.id,
          roleId: ownerRole.id,
          status: 'ACTIVE',
        },
      },
    },
    update: {},
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@brightloop.local' },
    create: {
      name: 'Morgan Blake (Admin)',
      email: 'admin@brightloop.local',
      passwordHash,
      isEmailVerified: true,
      userPreference: {
        create: {
          theme: 'dark',
          accentColor: 'indigo',
          density: 'comfortable',
        },
      },
      memberships: {
        create: {
          organizationId: org.id,
          roleId: adminRole.id,
          status: 'ACTIVE',
        },
      },
    },
    update: {},
  });

  const memberUser = await prisma.user.upsert({
    where: { email: 'member@brightloop.local' },
    create: {
      name: 'Jordan Hayes (Staff)',
      email: 'member@brightloop.local',
      passwordHash,
      isEmailVerified: true,
      userPreference: {
        create: {
          theme: 'dark',
          accentColor: 'indigo',
          density: 'comfortable',
        },
      },
      memberships: {
        create: {
          organizationId: org.id,
          roleId: memberRole.id,
          status: 'ACTIVE',
        },
      },
    },
    update: {},
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@brightloop.local' },
    create: {
      name: 'Sam Carter (Customer Portal)',
      email: 'customer@brightloop.local',
      passwordHash,
      isEmailVerified: true,
      userPreference: {
        create: {
          theme: 'dark',
          accentColor: 'blue',
          density: 'comfortable',
        },
      },
      memberships: {
        create: {
          organizationId: org.id,
          roleId: customerRole.id,
          status: 'ACTIVE',
        },
      },
    },
    update: {},
  });

  // Seed Clean User Credentials requested by user (satisfying password rules: >8 chars, upper, lower, special)
  const standardPass = await argon2.hash('Admin@12345', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
  });
  const adminPass = standardPass;
  const staffPass = standardPass;
  const ownerPass = standardPass;
  const customerPass = standardPass;

  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    create: {
      name: 'Admin User',
      email: 'admin@gmail.com',
      passwordHash: adminPass,
      isEmailVerified: true,
      memberships: {
        create: {
          organizationId: org.id,
          roleId: adminRole.id,
          status: 'ACTIVE',
        },
      },
    },
    update: { passwordHash: adminPass },
  });

  await prisma.user.upsert({
    where: { email: 'admin@brightloop.com' },
    create: {
      name: 'Admin User',
      email: 'admin@brightloop.com',
      passwordHash: adminPass,
      isEmailVerified: true,
      memberships: {
        create: {
          organizationId: org.id,
          roleId: adminRole.id,
          status: 'ACTIVE',
        },
      },
    },
    update: { passwordHash: adminPass },
  });

  await prisma.user.upsert({
    where: { email: 'staff@gmail.com' },
    create: {
      name: 'Staff Operations User',
      email: 'staff@gmail.com',
      passwordHash: staffPass,
      isEmailVerified: true,
      memberships: {
        create: {
          organizationId: org.id,
          roleId: memberRole.id,
          status: 'ACTIVE',
        },
      },
    },
    update: { passwordHash: staffPass },
  });

  await prisma.user.upsert({
    where: { email: 'staff@brightloop.com' },
    create: {
      name: 'Staff Operations User',
      email: 'staff@brightloop.com',
      passwordHash: staffPass,
      isEmailVerified: true,
      memberships: {
        create: {
          organizationId: org.id,
          roleId: memberRole.id,
          status: 'ACTIVE',
        },
      },
    },
    update: { passwordHash: staffPass },
  });

  await prisma.user.upsert({
    where: { email: 'owner@gmail.com' },
    create: {
      name: 'Workspace Owner',
      email: 'owner@gmail.com',
      passwordHash: ownerPass,
      isEmailVerified: true,
      memberships: {
        create: {
          organizationId: org.id,
          roleId: ownerRole.id,
          status: 'ACTIVE',
        },
      },
    },
    update: { passwordHash: ownerPass },
  });

  await prisma.user.upsert({
    where: { email: 'customer1@gmail.com' },
    create: {
      name: 'Alex Mercer',
      email: 'customer1@gmail.com',
      passwordHash: customerPass,
      isEmailVerified: true,
      memberships: {
        create: {
          organizationId: org.id,
          roleId: customerRole.id,
          status: 'ACTIVE',
        },
      },
    },
    update: { name: 'Alex Mercer', passwordHash: customerPass },
  });

  await prisma.user.upsert({
    where: { email: 'customer2@gmail.com' },
    create: {
      name: 'Marcus Vance',
      email: 'customer2@gmail.com',
      passwordHash: customerPass,
      isEmailVerified: true,
      memberships: {
        create: {
          organizationId: org.id,
          roleId: customerRole.id,
          status: 'ACTIVE',
        },
      },
    },
    update: { passwordHash: customerPass },
  });

  // 5. Seed Domain Entities: Products & Variants
  const productSoftware = await prisma.product.upsert({
    where: { id: 'prod-software-suite-001' },
    create: {
      id: 'prod-software-suite-001',
      organizationId: org.id,
      name: 'Brightloop Business Software',
      type: 'Software Subscription',
      salesPrice: 120.0,
      costPrice: 40.0,
      notes: 'Flagship enterprise subscription suite for automated operations.',
      variants: {
        create: [
          { name: 'Standard Edition', additionalPrice: 0.0 },
          { name: 'Odoo Brand Connector', additionalPrice: 560.0 }, // Mentioned in PDF Page 3!
        ],
      },
    },
    update: {},
  });

  const productStorage = await prisma.product.upsert({
    where: { id: 'prod-cloud-storage-002' },
    create: {
      id: 'prod-cloud-storage-002',
      organizationId: org.id,
      name: 'Cloud Storage & Archive Add-on',
      type: 'Add-on',
      salesPrice: 25.0,
      costPrice: 8.0,
      notes: 'High-speed encrypted document repository for customer invoices.',
    },
    update: {},
  });

  // 6. Seed Plans
  const planMonthly = await prisma.plan.upsert({
    where: { id: 'plan-monthly-growth-001' },
    create: {
      id: 'plan-monthly-growth-001',
      organizationId: org.id,
      productId: productSoftware.id,
      name: 'Monthly Growth Plan',
      price: 120.0,
      billingFrequency: 'MONTHLY',
      minQuantity: 1,
      allowEarlyClose: true,
      allowPause: true,
      allowRenewal: true,
    },
    update: {},
  });

  const planAnnual = await prisma.plan.upsert({
    where: { id: 'plan-annual-enterprise-002' },
    create: {
      id: 'plan-annual-enterprise-002',
      organizationId: org.id,
      productId: productSoftware.id,
      name: 'Annual Enterprise Plan',
      price: 1200.0,
      billingFrequency: 'YEARLY',
      minQuantity: 5,
      allowEarlyClose: false,
      allowPause: true,
      allowRenewal: true,
    },
    update: {},
  });

  // 7. Seed Tax Rule & Discount
  await prisma.taxRule.upsert({
    where: { id: 'tax-std-vat-001' },
    create: {
      id: 'tax-std-vat-001',
      organizationId: org.id,
      name: 'Standard VAT/GST',
      ratePercentage: 10.0,
      jurisdiction: 'Standard Corporate',
    },
    update: {},
  });

  await prisma.discount.upsert({
    where: { organizationId_code: { organizationId: org.id, code: 'VOLUME15' } },
    create: {
      organizationId: org.id,
      name: 'Volume Seat Discount 15%',
      code: 'VOLUME15',
      type: 'PERCENTAGE',
      value: 15.0,
      minPurchase: 0,
      minQuantity: 5,
      maxUsage: 100,
      scope: 'WHOLE_SUBSCRIPTION',
    },
    update: {},
  });

  // 8. Seed Customers
  const customerAcme = await prisma.customer.upsert({
    where: { id: 'cust-acme-corp-001' },
    create: {
      id: 'cust-acme-corp-001',
      organizationId: org.id,
      name: 'Acme Corporation',
      email: 'procurement@acme-corp.com',
      phone: '+1 555-0199',
      company: 'Acme Global Holdings',
      address: '100 Enterprise Way, Silicon Valley, CA',
      notes: 'Enterprise account with 100+ seats.',
      createdById: memberUser.id,
    },
    update: {},
  });

  const customerApex = await prisma.customer.upsert({
    where: { id: 'cust-apex-retail-002' },
    create: {
      id: 'cust-apex-retail-002',
      organizationId: org.id,
      name: 'Apex Retailers Inc.',
      email: 'billing@apexretail.com',
      phone: '+1 555-0144',
      company: 'Apex Retail Solutions',
      address: '42 Commerce Blvd, Austin, TX',
      notes: 'B2B boutique retailer scaling to national delivery.',
      createdById: memberUser.id,
    },
    update: {},
  });

  const customerPortalDemo = await prisma.customer.upsert({
    where: { id: 'cust-portal-demo-003' },
    create: {
      id: 'cust-portal-demo-003',
      organizationId: org.id,
      name: 'Sam Carter',
      email: 'customer@brightloop.local',
      phone: '+1 555-0188',
      company: 'Brightloop Demo Customer Co.',
      address: '77 Innovation Way, Denver, CO',
      notes: 'Customer portal test profile.',
      createdById: memberUser.id,
    },
    update: {},
  });

  const customerAlex = await prisma.customer.upsert({
    where: { id: 'cust-alex-mercer-001' },
    create: {
      id: 'cust-alex-mercer-001',
      organizationId: org.id,
      name: 'Alex Mercer',
      email: 'customer1@gmail.com',
      phone: '+1 555-0177',
      company: 'Mercer Software Enterprises',
      address: '450 Innovation Parkway, Suite 300, San Francisco, CA',
      notes: 'Key small business customer account.',
      createdById: memberUser.id,
    },
    update: {
      name: 'Alex Mercer',
      email: 'customer1@gmail.com',
    },
  });

  // 9. Seed Subscriptions & Invoices
  const subAcme = await prisma.subscription.upsert({
    where: { id: 'sub-acme-001' },
    create: {
      id: 'sub-acme-001',
      organizationId: org.id,
      subscriptionNumber: 'SUB-2026-001',
      customerId: customerAcme.id,
      planId: planMonthly.id,
      startDate: new Date(),
      billingFrequency: 'MONTHLY',
      paymentTerms: 'Net 30',
      subtotal: 120.0,
      taxAmount: 12.0,
      totalAmount: 132.0,
      status: 'ACTIVE',
      createdById: memberUser.id,
      lines: {
        create: [
          {
            productId: productSoftware.id,
            quantity: 1,
            unitPrice: 120.0,
            taxRate: 10.0,
            taxAmount: 12.0,
            lineTotal: 132.0,
          },
        ],
      },
    },
    update: {},
  });

  // Invoice 1: Paid
  const invPaid = await prisma.invoice.upsert({
    where: { id: 'inv-acme-001' },
    create: {
      id: 'inv-acme-001',
      organizationId: org.id,
      invoiceNumber: 'INV-2026-001',
      subscriptionId: subAcme.id,
      customerId: customerAcme.id,
      invoiceDate: new Date(Date.now() - 30 * 86400000),
      dueDate: new Date(Date.now() - 5 * 86400000),
      subtotal: 120.0,
      taxAmount: 12.0,
      totalAmount: 132.0,
      paidAmount: 132.0,
      outstandingAmount: 0.0,
      status: 'PAID',
      lines: {
        create: [
          {
            description: 'Monthly Growth Plan - Brightloop Business Software',
            quantity: 1,
            unitPrice: 120.0,
            taxRate: 10.0,
            taxAmount: 12.0,
            lineTotal: 132.0,
          },
        ],
      },
    },
    update: {},
  });

  // Payment for Invoice 1
  await prisma.payment.upsert({
    where: { id: 'pay-acme-001' },
    create: {
      id: 'pay-acme-001',
      organizationId: org.id,
      paymentReference: 'PAY-2026-001',
      invoiceId: invPaid.id,
      customerId: customerAcme.id,
      amount: 132.0,
      paymentMethod: 'BANK_TRANSFER',
      paymentDate: new Date(Date.now() - 4 * 86400000),
      note: 'Wire transfer confirmed via settlement batch #8821.',
      recordedById: memberUser.id,
    },
    update: {},
  });

  // Invoice 2: Confirmed / Due
  await prisma.invoice.upsert({
    where: { id: 'inv-acme-002' },
    create: {
      id: 'inv-acme-002',
      organizationId: org.id,
      invoiceNumber: 'INV-2026-002',
      subscriptionId: subAcme.id,
      customerId: customerAcme.id,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 86400000),
      subtotal: 120.0,
      taxAmount: 12.0,
      totalAmount: 132.0,
      paidAmount: 0.0,
      outstandingAmount: 132.0,
      status: 'CONFIRMED',
      lines: {
        create: [
          {
            description: 'Monthly Growth Plan - Current Period Renewal',
            quantity: 1,
            unitPrice: 120.0,
            taxRate: 10.0,
            taxAmount: 12.0,
            lineTotal: 132.0,
          },
        ],
      },
    },
    update: {},
  });

  // Subscriptions & Invoices for Alex Mercer (Customer1)
  const subAlex = await prisma.subscription.upsert({
    where: { id: 'sub-alex-001' },
    create: {
      id: 'sub-alex-001',
      organizationId: org.id,
      subscriptionNumber: 'SUB-2026-002',
      customerId: customerAlex.id,
      planId: planMonthly.id,
      startDate: new Date(Date.now() - 60 * 86400000),
      billingFrequency: 'MONTHLY',
      paymentTerms: 'Net 30',
      subtotal: 509.09,
      taxAmount: 50.91,
      totalAmount: 560.0,
      status: 'ACTIVE',
      createdById: memberUser.id,
      lines: {
        create: [
          {
            productId: productSoftware.id,
            quantity: 1,
            unitPrice: 560.0,
            taxRate: 10.0,
            taxAmount: 50.91,
            lineTotal: 560.0,
          },
        ],
      },
    },
    update: {},
  });

  // Alex Mercer Invoice 1: Paid (₹560)
  const invAlex1 = await prisma.invoice.upsert({
    where: { id: 'inv-alex-001' },
    create: {
      id: 'inv-alex-001',
      organizationId: org.id,
      invoiceNumber: 'INV-ALEX-001',
      subscriptionId: subAlex.id,
      customerId: customerAlex.id,
      invoiceDate: new Date(Date.now() - 60 * 86400000),
      dueDate: new Date(Date.now() - 30 * 86400000),
      subtotal: 509.09,
      taxAmount: 50.91,
      totalAmount: 560.0,
      paidAmount: 560.0,
      outstandingAmount: 0.0,
      status: 'PAID',
      lines: {
        create: [
          {
            description: 'Monthly Growth Plan with Odoo Connector Variant',
            quantity: 1,
            unitPrice: 560.0,
            taxRate: 10.0,
            taxAmount: 50.91,
            lineTotal: 560.0,
          },
        ],
      },
    },
    update: {},
  });

  // Alex Mercer Payment 1 (₹560)
  await prisma.payment.upsert({
    where: { id: 'pay-alex-001' },
    create: {
      id: 'pay-alex-001',
      organizationId: org.id,
      paymentReference: 'PAY-ALEX-001',
      invoiceId: invAlex1.id,
      customerId: customerAlex.id,
      amount: 560.0,
      paymentMethod: 'CREDIT_CARD',
      paymentDate: new Date(Date.now() - 30 * 86400000),
      note: 'Settled via Corporate Card ending 4242',
      recordedById: memberUser.id,
    },
    update: {},
  });

  // Alex Mercer Invoice 2: Paid (₹560)
  const invAlex2 = await prisma.invoice.upsert({
    where: { id: 'inv-alex-002' },
    create: {
      id: 'inv-alex-002',
      organizationId: org.id,
      invoiceNumber: 'INV-ALEX-002',
      subscriptionId: subAlex.id,
      customerId: customerAlex.id,
      invoiceDate: new Date(Date.now() - 30 * 86400000),
      dueDate: new Date(),
      subtotal: 509.09,
      taxAmount: 50.91,
      totalAmount: 560.0,
      paidAmount: 560.0,
      outstandingAmount: 0.0,
      status: 'PAID',
      lines: {
        create: [
          {
            description: 'Monthly Growth Plan with Odoo Connector Variant',
            quantity: 1,
            unitPrice: 560.0,
            taxRate: 10.0,
            taxAmount: 50.91,
            lineTotal: 560.0,
          },
        ],
      },
    },
    update: {},
  });

  // Alex Mercer Payment 2 (₹560)
  await prisma.payment.upsert({
    where: { id: 'pay-alex-002' },
    create: {
      id: 'pay-alex-002',
      organizationId: org.id,
      paymentReference: 'PAY-ALEX-002',
      invoiceId: invAlex2.id,
      customerId: customerAlex.id,
      amount: 560.0,
      paymentMethod: 'CREDIT_CARD',
      paymentDate: new Date(),
      note: 'Settled via Corporate Card ending 4242',
      recordedById: memberUser.id,
    },
    update: {},
  });

  console.log('✅ Brightloop database seed completed successfully!');
  console.log('==============================================');
  console.log('Default Demo Accounts (Password: Admin@12345):');
  console.log('Admin:    admin@brightloop.com / admin@brightloop.local / admin@gmail.com');
  console.log('Staff:    staff@brightloop.com / member@brightloop.local / staff@gmail.com');
  console.log('Customer: customer1@gmail.com (Alex Mercer)');
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
