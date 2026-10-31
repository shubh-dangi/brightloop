import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ProductsModule } from "./modules/products/products.module";
import { PlansModule } from "./modules/plans/plans.module";
import { QuotationsModule } from "./modules/quotations/quotations.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { BillingModule } from "./modules/billing/billing.module";
import { InvoicesModule } from "./modules/invoices/invoices.module";
import { TaxesModule } from "./modules/taxes/taxes.module";
import { DiscountsModule } from "./modules/discounts/discounts.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    PlansModule,
    QuotationsModule,
    SubscriptionsModule,
    BillingModule,
    InvoicesModule,
    TaxesModule,
    DiscountsModule,
    PaymentsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}

