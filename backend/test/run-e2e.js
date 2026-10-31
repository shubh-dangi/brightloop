const request = require("supertest");
const { Test } = require("@nestjs/testing");
const { ValidationPipe } = require("@nestjs/common");
const { AppModule } = require("../dist/src/app.module");
const { AllExceptionsFilter } = require("../dist/src/common/filters/http-exception.filter");
const { PrismaService } = require("../dist/src/common/prisma/prisma.service");

async function run() {
  console.log("\n🧪 Running Brightloop Subscription Management System E2E Suite\n");

  const startTime = Date.now();
  let passed = 0;
  let failed = 0;

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();

  const prisma = app.get(PrismaService);
  const server = app.getHttpServer();

  // Reset due subscription for repeatable billing test
  await prisma.subscription.updateMany({
    where: { subscriptionNumber: "SUB-2026-0002" },
    data: { nextBillingDate: new Date(Date.now() - 60000) },
  });

  // Authenticate Admin
  let adminRes = await request(server)
    .post("/api/auth/login")
    .send({ email: "admin@gmail.com", password: "admin@123" });
  if (!adminRes.body?.tokens?.accessToken && !adminRes.body?.accessToken) {
    adminRes = await request(server)
      .post("/api/auth/login")
      .send({ email: "admin@brightloop.com", password: "AdminBright#2026" });
  }
  const adminToken = adminRes.body?.accessToken || adminRes.body?.tokens?.accessToken;

  // Authenticate Customer
  let custRes = await request(server)
    .post("/api/auth/login")
    .send({ email: "customer1@gmail.com", password: "customer@123" });
  if (!custRes.body?.tokens?.accessToken && !custRes.body?.accessToken) {
    custRes = await request(server)
      .post("/api/auth/login")
      .send({ email: "john@bakeryshop.com", password: "Customer#2026" });
  }
  const customerToken = custRes.body?.accessToken || custRes.body?.tokens?.accessToken;

  async function testCase(name, fn) {
    const t0 = Date.now();
    try {
      await fn();
      const elapsed = Date.now() - t0;
      console.log(`  \x1b[32m✓\x1b[0m ${name} \x1b[90m(${elapsed}ms)\x1b[0m`);
      passed++;
    } catch (err) {
      const elapsed = Date.now() - t0;
      console.log(`  \x1b[31m×\x1b[0m ${name} \x1b[90m(${elapsed}ms)\x1b[0m`);
      console.error(`    \x1b[31mError: ${err.message}\x1b[0m`);
      failed++;
    }
  }

  // 1. Auth Login
  await testCase("1. Auth Login: Admin login returns JWT tokens and role", async () => {
    if (!adminToken) throw new Error("Admin token is undefined");
  });

  // 2. Auth Signup Validation
  await testCase("2. Auth Signup Validation: Rejects password without special characters or too short", async () => {
    const res = await request(server)
      .post("/api/auth/signup")
      .send({ email: "weak@test.com", password: "weakpassword", name: "Weak Test" });
    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
    if (res.body.code !== "VALIDATION_ERROR") throw new Error(`Expected VALIDATION_ERROR code`);
  });

  // 3. Products & Variants
  await testCase("3. Products & Variants: Lists products and verifies Odoo brand variant has +$560", async () => {
    const res = await request(server).get("/api/products");
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const erp = res.body.find((p) => p.name === "Brightloop ERP Cloud");
    if (!erp) throw new Error("Brightloop ERP Cloud product not found");
    const odooVar = erp.variants.find((v) => v.attributeValue === "Odoo");
    if (!odooVar) throw new Error("Odoo variant not found");
    if (odooVar.extraPrice !== 560) throw new Error(`Expected variant price 560, got ${odooVar.extraPrice}`);
  });

  // 4. Plans
  await testCase("4. Plans: Lists recurring plans (Monthly & Yearly)", async () => {
    const res = await request(server).get("/api/plans");
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    if (res.body.length < 2) throw new Error(`Expected at least 2 plans, got ${res.body.length}`);
  });

  // 5. Tenant Isolation
  await testCase("5. Subscriptions Tenant Isolation: Customer only sees their own subscriptions", async () => {
    const res = await request(server)
      .get("/api/subscriptions")
      .set("Authorization", `Bearer ${customerToken}`);
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    if (res.body.length !== 1) throw new Error(`Expected 1 customer subscription, got ${res.body.length}`);
    if (res.body[0].subscriptionNumber !== "SUB-2026-0001") {
      throw new Error(`Expected SUB-2026-0001, got ${res.body[0].subscriptionNumber}`);
    }
  });

  // 6. Subscriptions RBAC
  await testCase("6. Subscriptions RBAC: Admin sees all subscriptions", async () => {
    const res = await request(server)
      .get("/api/subscriptions")
      .set("Authorization", `Bearer ${adminToken}`);
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    if (res.body.length < 2) throw new Error(`Expected >= 2 subscriptions for admin, got ${res.body.length}`);
  });

  // 7. Automated Billing Day Engine
  await testCase("7. Automated Billing Day Engine: Generates invoice without double-billing", async () => {
    const res = await request(server)
      .post("/api/billing/run")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});
    if (res.status !== 201) throw new Error(`Expected status 201, got ${res.status}`);
    if (!res.body.success) throw new Error("Billing run did not report success");
    if (res.body.processedCount < 1) throw new Error("No subscriptions processed in due billing run");

    // Idempotency: Immediate re-run processes 0
    const reRun = await request(server)
      .post("/api/billing/run")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});
    if (reRun.body.processedCount !== 0) {
      throw new Error(`Idempotency violation: re-run processed ${reRun.body.processedCount}`);
    }
  });

  // 8. Finance Analytics
  await testCase("8. Finance Lead Analytics: Returns MRR, ARR, active subscriptions in <2s", async () => {
    const t0 = Date.now();
    const res = await request(server)
      .get("/api/analytics/finance")
      .set("Authorization", `Bearer ${adminToken}`);
    const duration = Date.now() - t0;
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    if (duration >= 2000) throw new Error(`Analytics too slow: took ${duration}ms`);
    if (!res.body.overview || typeof res.body.overview.mrr !== "number") {
      throw new Error("Missing overview.mrr");
    }
    if (typeof res.body.overview.arr !== "number") {
      throw new Error("Missing overview.arr");
    }
  });

  // 9. RFC 7807 Error Format
  await testCase("9. RFC 7807 Error Format: Returns standard problem details on 404", async () => {
    const res = await request(server).get("/api/unknown-endpoint");
    if (res.status !== 404) throw new Error(`Expected status 404, got ${res.status}`);
    if (res.body.type !== "https://tools.ietf.org/html/rfc7807") {
      throw new Error(`Expected RFC 7807 type, got ${res.body.type}`);
    }
  });

  await app.close();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n---------------------------------------------------------`);
  if (failed === 0) {
    console.log(`\x1b[32m✔ All ${passed} tests passed successfully!\x1b[0m \x1b[90m(${totalTime}s)\x1b[0m\n`);
    process.exit(0);
  } else {
    console.log(`\x1b[31m✖ Tests failed: ${failed} failed, ${passed} passed\x1b[0m \x1b[90m(${totalTime}s)\x1b[0m\n`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal Test Suite Error:", err);
  process.exit(1);
});
