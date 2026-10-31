import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Brightloop Subscription Management System...");

  // Clean existing records
  await prisma.auditLog.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoiceLine.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.subscriptionLine.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.quotationTemplateLine.deleteMany({});
  await prisma.quotationTemplate.deleteMany({});
  await prisma.discountRule.deleteMany({});
  await prisma.taxRule.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.plan.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Users & Personas
  const adminPass = await bcrypt.hash("AdminBright#2026", 10);
  const staffPass = await bcrypt.hash("StaffBright#2026", 10);
  const custPass = await bcrypt.hash("Customer#2026", 10);
  const demoPass = await bcrypt.hash("Password123!", 10);

  // Simplified Clean Accounts (Requested by user)
  const simpleAdminPass = await bcrypt.hash("Admin@123", 10);
  const simpleStaffPass = await bcrypt.hash("Staff@123", 10);
  const simpleCustomerPass = await bcrypt.hash("Customer@123", 10);
  const simpleOwnerPass = await bcrypt.hash("Owner@123", 10);

  await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      passwordHash: simpleAdminPass,
      name: "Admin User",
      role: "ADMIN",
      companyName: "Brightloop HQ",
    },
  });

  await prisma.user.create({
    data: {
      email: "staff@gmail.com",
      passwordHash: simpleStaffPass,
      name: "Staff User (Sales & Operations)",
      role: "STAFF",
      companyName: "Brightloop HQ",
    },
  });

  await prisma.user.create({
    data: {
      email: "owner@gmail.com",
      passwordHash: simpleOwnerPass,
      name: "Owner User",
      role: "ADMIN",
      companyName: "Brightloop HQ",
    },
  });

  // Frontend 1-click demo accounts
  await prisma.user.create({
    data: {
      email: "owner@brightloop.local",
      passwordHash: demoPass,
      name: "Taylor Reed (Owner)",
      role: "ADMIN",
      companyName: "Brightloop Primary Workspace",
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@brightloop.local",
      passwordHash: demoPass,
      name: "Jordan Hayes (Admin)",
      role: "ADMIN",
      companyName: "Brightloop Primary Workspace",
    },
  });

  await prisma.user.create({
    data: {
      email: "member@brightloop.local",
      passwordHash: demoPass,
      name: "Morgan Lee (Member)",
      role: "STAFF",
      companyName: "Brightloop Primary Workspace",
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@brightloop.com",
      passwordHash: adminPass,
      name: "Arthur Finch (Admin)",
      role: "ADMIN",
      companyName: "Brightloop Software HQ",
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "sarah.rep@brightloop.com",
      passwordHash: staffPass,
      name: "Sarah Jenkins (Sales Rep)",
      role: "STAFF",
      companyName: "Brightloop Software HQ",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: "customer1@gmail.com",
      passwordHash: simpleCustomerPass,
      name: "Customer 1 (John Miller - Bakery Shop)",
      role: "CUSTOMER",
      companyName: "Miller Artisan Bakery",
      phone: "+1 555-0101",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "customer2@gmail.com",
      passwordHash: simpleCustomerPass,
      name: "Customer 2 (Marcus Vance - Apex Corp)",
      role: "CUSTOMER",
      companyName: "Apex Global Enterprises",
      phone: "+1 555-0188",
    },
  });

  // Secondary demo customer aliases
  await prisma.user.create({
    data: {
      email: "john@bakeryshop.com",
      passwordHash: custPass,
      name: "John Miller (Bakery)",
      role: "CUSTOMER",
      companyName: "Miller Artisan Bakery",
      phone: "+1 555-0101",
    },
  });

  await prisma.user.create({
    data: {
      email: "finance@apexcorp.com",
      passwordHash: custPass,
      name: "Marcus Vance (Apex)",
      role: "CUSTOMER",
      companyName: "Apex Global Enterprises",
      phone: "+1 555-0188",
    },
  });

  console.log("✅ Seeded Personas: Admin, Staff, Owner, Customer 1, and Customer 2");

  // 2. Tax Rules
  const standardVat = await prisma.taxRule.create({
    data: {
      name: "Standard Commercial VAT",
      rate: 18.0,
      isDefault: true,
    },
  });

  console.log("✅ Seeded Tax Rules (18% Standard VAT)");

  // 3. Discount Rules
  const discountRule = await prisma.discountRule.create({
    data: {
      code: "SCALE10",
      type: "PERCENTAGE",
      value: 10.0,
      scope: "SUBSCRIPTION",
      minQuantity: 3,
      minPurchase: 500.0,
      maxUses: 100,
    },
  });

  console.log("✅ Seeded Discount Rules (SCALE10: 10% off for >=3 seats)");

  // 4. Products & Variants (With Odoo Brand variant +$560)
  const erpProduct = await prisma.product.create({
    data: {
      name: "Brightloop ERP Cloud",
      type: "SOFTWARE",
      salesPrice: 1200.0,
      costPrice: 400.0,
      notes: "Core business ERP system with inventory, finance and sales modules.",
      variants: {
        create: [
          {
            name: "Odoo Brand Edition",
            attributeKey: "Brand",
            attributeValue: "Odoo",
            extraPrice: 560.0, // Adds $560 as requested in problem statement!
          },
          {
            name: "Standard Edition",
            attributeKey: "Brand",
            attributeValue: "Standard",
            extraPrice: 0.0,
          },
        ],
      },
    },
    include: { variants: true },
  });

  const crmProduct = await prisma.product.create({
    data: {
      name: "CRM & Pipeline Automation",
      type: "ADDON",
      salesPrice: 350.0,
      costPrice: 100.0,
      notes: "Customer relationship tracking and pipeline deal automations.",
    },
  });

  console.log("✅ Seeded Products & Variants (with Odoo Brand Edition +$560)");

  // 5. Plans (Monthly, Yearly, Weekly)
  const monthlyPlan = await prisma.plan.create({
    data: {
      name: "SME Monthly Plan",
      price: 199.0,
      billingInterval: "MONTHLY",
      minQuantity: 1,
      endBehavior: "RENEWABLE",
    },
  });

  const annualPlan = await prisma.plan.create({
    data: {
      name: "Enterprise Annual Contract",
      price: 1800.0,
      billingInterval: "YEARLY",
      minQuantity: 5,
      endBehavior: "RENEWABLE",
    },
  });

  console.log("✅ Seeded Recurring Plans (Monthly SME & Annual Enterprise)");

  // 6. Quotation Template
  const odooVariant = erpProduct.variants.find((v) => v.attributeValue === "Odoo");

  await prisma.quotationTemplate.create({
    data: {
      name: "Enterprise Odoo Suite Proposal",
      planId: annualPlan.id,
      validityDays: 30,
      lines: {
        create: [
          {
            productId: erpProduct.id,
            variantId: odooVariant?.id,
            quantity: 5,
          },
          {
            productId: crmProduct.id,
            quantity: 5,
          },
        ],
      },
    },
  });

  console.log("✅ Seeded Quotation Template");

  // 7. Active Subscriptions
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const sub1 = await prisma.subscription.create({
    data: {
      subscriptionNumber: "SUB-2026-0001",
      customerId: customer1.id,
      planId: monthlyPlan.id,
      status: "ACTIVE",
      startDate: new Date(),
      nextBillingDate: nextMonth,
      paymentTerms: "Net 15",
      totalAmount: 1416.0,
      lines: {
        create: [
          {
            productId: erpProduct.id,
            quantity: 1,
            unitPrice: 1200.0,
            taxRate: 18.0,
            amount: 1416.0,
          },
        ],
      },
    },
  });

  const sub2 = await prisma.subscription.create({
    data: {
      subscriptionNumber: "SUB-2026-0002",
      customerId: customer2.id,
      planId: annualPlan.id,
      status: "ACTIVE",
      startDate: new Date(),
      nextBillingDate: new Date(), // Due today for immediate billing test
      paymentTerms: "Net 30",
      totalAmount: 2076.8,
      lines: {
        create: [
          {
            productId: erpProduct.id,
            variantId: odooVariant?.id,
            quantity: 1,
            unitPrice: 1760.0, // 1200 + 560
            taxRate: 18.0,
            amount: 2076.8,
          },
        ],
      },
    },
  });

  console.log("✅ Seeded 2 Active Subscriptions (Bakery Shop & Apex Corp)");

  // 8. Invoices & Payments
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-0001",
      subscriptionId: sub1.id,
      customerId: customer1.id,
      issueDate: new Date(),
      dueDate: nextMonth,
      subtotal: 1200.0,
      taxTotal: 216.0,
      discountTotal: 0.0,
      grandTotal: 1416.0,
      status: "PAID",
      notes: "First month onboarding invoice",
      lines: {
        create: [
          {
            productId: erpProduct.id,
            description: "Brightloop ERP Cloud (Standard Edition)",
            quantity: 1,
            unitPrice: 1200.0,
            taxAmount: 216.0,
            lineTotal: 1416.0,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice1.id,
      amount: 1416.0,
      method: "BANK_TRANSFER",
      reference: "WIRE-MILLER-9912",
      note: "Full settlement received via Citibank",
    },
  });

  console.log("✅ Seeded Invoice & Payment ($1,416 Paid)");

  console.log("🎉 Brightloop Database Seeding Finished Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

