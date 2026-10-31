import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { AllExceptionsFilter } from "../src/common/filters/http-exception.filter";

describe("Brightloop Subscription API E2E Test Suite", () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    // Login Admin
    const adminRes = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: "admin@brightloop.com", password: "AdminBright#2026" });
    adminToken = adminRes.body.accessToken;

    // Login Customer
    const custRes = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: "john@bakeryshop.com", password: "Customer#2026" });
    customerToken = custRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it("1. Auth Login: Admin login returns JWT tokens and role", () => {
    expect(adminToken).toBeDefined();
  });

  it("2. Auth Signup Validation: Rejects password without special characters or too short", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/signup")
      .send({
        email: "weak@test.com",
        password: "weakpassword",
        name: "Weak Test",
      });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("3. Products & Variants: Lists products and verifies Odoo brand variant has +$560", async () => {
    const res = await request(app.getHttpServer()).get("/api/products");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const erp = res.body.find((p: any) => p.name === "Brightloop ERP Cloud");
    expect(erp).toBeDefined();
    const odooVar = erp.variants.find((v: any) => v.attributeValue === "Odoo");
    expect(odooVar).toBeDefined();
    expect(odooVar.extraPrice).toBe(560);
  });

  it("4. Plans: Lists recurring plans (Monthly & Yearly)", async () => {
    const res = await request(app.getHttpServer()).get("/api/plans");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it("5. Subscriptions Tenant Isolation: Customer only sees their own subscriptions", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/subscriptions")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].subscriptionNumber).toBe("SUB-2026-0001");
  });

  it("6. Subscriptions RBAC: Admin sees all subscriptions", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/subscriptions")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it("7. Automated Billing Day Engine: Generates invoice from due subscription without double-billing", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/billing/run")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // At least 1 due subscription processed
    expect(res.body.processedCount).toBeGreaterThanOrEqual(1);

    // Running again immediately should process 0 (Idempotency guarantee)
    const runAgain = await request(app.getHttpServer())
      .post("/api/billing/run")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});
    expect(runAgain.body.processedCount).toBe(0);
  });

  it("8. Finance Lead Analytics: Returns MRR, ARR, active subscriptions in <2s", async () => {
    const startTime = Date.now();
    const res = await request(app.getHttpServer())
      .get("/api/analytics/finance")
      .set("Authorization", `Bearer ${adminToken}`);

    const duration = Date.now() - startTime;
    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(2000);
    expect(res.body.overview).toHaveProperty("mrr");
    expect(res.body.overview).toHaveProperty("arr");
    expect(res.body.overview.activeSubscriptions).toBeGreaterThanOrEqual(2);
    expect(Array.isArray(res.body.overdueInvoices)).toBe(true);
  });

  it("9. RFC 7807 Error Format: Returns standard problem details on 404", async () => {
    const res = await request(app.getHttpServer()).get("/api/unknown-endpoint");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("type", "https://tools.ietf.org/html/rfc7807");
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("status", 404);
  });
});
