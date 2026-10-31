import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { EmailVerificationPage } from '../pages/auth/EmailVerificationPage';
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage';

// Core Pages
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { ActivityPage } from '../pages/activity/ActivityPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { PreferencesPage } from '../pages/preferences/PreferencesPage';

// Settings Pages
import { GeneralSettingsPage } from '../pages/settings/GeneralSettingsPage';
import { AppearanceSettingsPage } from '../pages/settings/AppearanceSettingsPage';
import { TeamMembersPage } from '../pages/settings/TeamMembersPage';
import { RolesPermissionsPage } from '../pages/settings/RolesPermissionsPage';

// Management (Generic CRUD)
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
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* System Standalone Pages */}
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/offline" element={<OfflinePage />} />
      <Route path="/500" element={<ServerErrorPage />} />

      {/* Protected SaaS App Routes inside AppShell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/records" element={<RecordsListPage />} />
          <Route path="/records/:id" element={<RecordDetailPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/preferences" element={<PreferencesPage />} />

          {/* Settings Section */}
          <Route path="/settings/general" element={<GeneralSettingsPage />} />
          <Route path="/settings/appearance" element={<AppearanceSettingsPage />} />
          <Route path="/settings/team" element={<TeamMembersPage />} />
          <Route path="/settings/roles" element={<RolesPermissionsPage />} />
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
