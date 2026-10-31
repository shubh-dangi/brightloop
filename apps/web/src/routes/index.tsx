import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';

// Public Marketing Landing Page
import { LandingPage } from '../pages/landing/LandingPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { EmailVerificationPage } from '../pages/auth/EmailVerificationPage';
import { AcceptInvitePage } from '../pages/auth/AcceptInvitePage';
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage';
import { ForbiddenPage } from '../pages/system/ForbiddenPage';

// Core Operations & Workspace Pages
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { ActivityPage } from '../pages/activity/ActivityPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { PreferencesPage } from '../pages/preferences/PreferencesPage';

// Domain Modules: Customers, Products, Plans, Quotations, Subscriptions, Invoices, Discounts, Payments, Reports
import { CustomersListPage } from '../pages/customers/CustomersListPage';
import { CustomerDetailPage } from '../pages/customers/CustomerDetailPage';
import { ProductsListPage } from '../pages/products/ProductsListPage';
import { ProductDetailPage } from '../pages/products/ProductDetailPage';
import { PlansListPage } from '../pages/plans/PlansListPage';
import { QuotationsListPage } from '../pages/quotations/QuotationsListPage';
import { CreateQuotationPage } from '../pages/quotations/CreateQuotationPage';
import { QuotationDetailPage } from '../pages/quotations/QuotationDetailPage';
import { SubscriptionsListPage } from '../pages/subscriptions/SubscriptionsListPage';
import { SubscriptionDetailPage } from '../pages/subscriptions/SubscriptionDetailPage';
import { InvoicesListPage } from '../pages/invoices/InvoicesListPage';
import { InvoiceDetailPage } from '../pages/invoices/InvoiceDetailPage';
import { DiscountsListPage } from '../pages/discounts/DiscountsListPage';
import { PaymentsListPage } from '../pages/payments/PaymentsListPage';
import { ReportsPage } from '../pages/reports/ReportsPage';

// Administration Settings Pages (Admin / Owner Only)
import { GeneralSettingsPage } from '../pages/settings/GeneralSettingsPage';
import { AppearanceSettingsPage } from '../pages/settings/AppearanceSettingsPage';
import { TeamMembersPage } from '../pages/settings/TeamMembersPage';
import { RolesPermissionsPage } from '../pages/settings/RolesPermissionsPage';

// Management (Generic fallback)
import { RecordsListPage } from '../pages/management/RecordsListPage';
import { RecordDetailPage } from '../pages/management/RecordDetailPage';

// System States
import { NotFoundPage } from '../pages/system/NotFoundPage';
import { ServerErrorPage } from '../pages/system/ServerErrorPage';
import { MaintenancePage } from '../pages/system/MaintenancePage';
import { OfflinePage } from '../pages/system/OfflinePage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Marketing Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* System Standalone Pages */}
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/offline" element={<OfflinePage />} />
      <Route path="/500" element={<ServerErrorPage />} />

      {/* Protected SaaS App Routes inside AppShell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Customer Management */}
          <Route path="/customers" element={<CustomersListPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />

          {/* Product Catalog */}
          <Route path="/products" element={<ProductsListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          {/* Subscription Plans */}
          <Route path="/plans" element={<PlansListPage />} />

          {/* Quotations */}
          <Route path="/quotations" element={<QuotationsListPage />} />
          <Route path="/quotations/new" element={<CreateQuotationPage />} />
          <Route path="/quotations/:id" element={<QuotationDetailPage />} />

          {/* Subscriptions */}
          <Route path="/subscriptions" element={<SubscriptionsListPage />} />
          <Route path="/subscriptions/:id" element={<SubscriptionDetailPage />} />

          {/* Invoices */}
          <Route path="/invoices" element={<InvoicesListPage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />

          {/* Discounts */}
          <Route path="/discounts" element={<DiscountsListPage />} />

          {/* Payments */}
          <Route path="/payments" element={<PaymentsListPage />} />

          {/* Reports */}
          <Route path="/reports" element={<ReportsPage />} />

          {/* Operations & System */}
          <Route path="/records" element={<RecordsListPage />} />
          <Route path="/records/:id" element={<RecordDetailPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/settings/appearance" element={<AppearanceSettingsPage />} />

          {/* Administrative Settings (Protected by RoleGuard: Admin & Owner only) */}
          <Route element={<RoleGuard allowedRoles={['OWNER', 'ADMIN']} />}>
            <Route path="/settings/general" element={<GeneralSettingsPage />} />
            <Route path="/settings/team" element={<TeamMembersPage />} />
            <Route path="/settings/roles" element={<RolesPermissionsPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
