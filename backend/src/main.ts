import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  // 1. Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
    })
  );

  // 2. Cross-Origin Resource Sharing (CORS) - Connects with React 19 Frontend
  app.enableCors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4000",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "x-organization-id",
    ],
  });

  // 3. Global Route Prefix: api/v1 (and backward compatible with api)
  app.setGlobalPrefix("api/v1");

  // 4. Input Validation & Transformation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    })
  );

  // 5. Global Exception Filter (RFC 7807 Problem Details)
  app.useGlobalFilters(new AllExceptionsFilter());

  // 6. Global Response Envelope Interceptor ({ success: true, message: '...', data: ... })
  app.useGlobalInterceptors(new TransformInterceptor());

  // 7. OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle("Brightloop Subscription Management API")
    .setDescription(
      "Enterprise Recurring Billing & Subscription Engine for Brightloop Software (Odoo Hackathon)"
    )
    .setVersion("1.0.0")
    .addBearerAuth()
    .addApiKey({ type: "apiKey", name: "x-organization-id", in: "header" }, "x-organization-id")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Port 4000 matches Frontend Vite proxy (/api -> http://localhost:4000)
  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`=======================================================`);
  logger.log(`🚀 Brightloop API Server running on: http://localhost:${port}/api/v1`);
  logger.log(`📑 Swagger Documentation ready at: http://localhost:${port}/api/docs`);
  logger.log(`💻 Ready for Frontend at: http://localhost:5173`);
  logger.log(`=======================================================`);
}

bootstrap();

