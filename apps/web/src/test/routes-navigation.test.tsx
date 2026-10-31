import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppRoutes } from '../routes';
import { useAuthStore } from '../stores/authStore';
import { RoleGuard } from '../routes/RoleGuard';

// Mock API client to avoid real network requests in jsdom tests
vi.mock('../services/api', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { data: [] } }),
    post: vi.fn().mockResolvedValue({ data: { data: {} } }),
    patch: vi.fn().mockResolvedValue({ data: { data: {} } }),
    delete: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
  setAuthToken: vi.fn(),
  setActiveOrganizationId: vi.fn(),
}));

describe('Complete Route & Navigation Security Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Public & Marketing Routes', () => {
    it('renders LandingPage on root route "/"', () => {
      useAuthStore.setState({ isAuthenticated: false, isLoading: false, role: null });

      render(
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      );

      // Verifies Landing Page Hero heading
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByText(/Brightloop/i).length).toBeGreaterThan(0);
    });

    it('renders LoginPage on "/login"', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /Sign in to your account/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
    });

    it('renders SignupPage on "/signup"', () => {
      render(
        <MemoryRouter initialEntries={['/signup']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByText(/Start Managing Smarter with Brightloop/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument();
    });

    it('renders ForgotPasswordPage on "/forgot-password"', () => {
      render(
        <MemoryRouter initialEntries={['/forgot-password']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /Forgot your password\?/i })).toBeInTheDocument();
    });

    it('renders ResetPasswordPage on "/reset-password"', () => {
      render(
        <MemoryRouter initialEntries={['/reset-password']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /Create a New Password/i })).toBeInTheDocument();
    });
  });

  describe('2. Standalone System & Error Pages', () => {
    it('renders 404 NotFoundPage on unknown route', () => {
      render(
        <MemoryRouter initialEntries={['/this-route-does-not-exist-at-all']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByText(/404 \/\/ RESOURCE_NOT_FOUND/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Page Not Located/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go Back/i })).toBeInTheDocument();
    });

    it('renders 403 ForbiddenPage / UnauthorizedPage on "/unauthorized" and "/403"', () => {
      render(
        <MemoryRouter initialEntries={['/unauthorized']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByText(/403 \/\/ INSUFFICIENT_PERMISSIONS/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Access Restricted/i })).toBeInTheDocument();
    });

    it('renders 500 ServerErrorPage on "/500"', () => {
      render(
        <MemoryRouter initialEntries={['/500']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByText(/500 \/\/ INTERNAL_SERVER_ERROR/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Service Exception/i })).toBeInTheDocument();
    });

    it('renders MaintenancePage on "/maintenance"', () => {
      render(
        <MemoryRouter initialEntries={['/maintenance']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByText(/503 \/\/ MAINTENANCE_ACTIVE/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Scheduled Maintenance/i })).toBeInTheDocument();
    });

    it('renders OfflinePage on "/offline"', () => {
      render(
        <MemoryRouter initialEntries={['/offline']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByText(/OFFLINE \/\/ NETWORK_DISCONNECTED/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Connection Lost/i })).toBeInTheDocument();
    });
  });

  describe('3. Protected Routes & Authentication Enforcement', () => {
    it('redirects unauthenticated users from "/dashboard" to "/login"', () => {
      useAuthStore.setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        role: null,
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppRoutes />
        </MemoryRouter>
      );

      // Should redirect to login page
      expect(screen.getByRole('heading', { name: /Sign in to your account/i })).toBeInTheDocument();
    });
  });

  describe('4. Role-Based Access Control (RBAC) Guard Enforcement', () => {
    it('blocks CUSTOMER role from accessing staff customer-management and redirects to /unauthorized', () => {
      useAuthStore.setState({
        isAuthenticated: true,
        isLoading: false,
        role: 'CUSTOMER',
      });

      render(
        <MemoryRouter initialEntries={['/customers']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByText(/403 \/\/ INSUFFICIENT_PERMISSIONS/i)).toBeInTheDocument();
    });

    it('blocks CUSTOMER role from accessing quotation creation "/quotations/new"', () => {
      useAuthStore.setState({
        isAuthenticated: true,
        isLoading: false,
        role: 'CUSTOMER',
      });

      render(
        <MemoryRouter initialEntries={['/quotations/new']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByText(/403 \/\/ INSUFFICIENT_PERMISSIONS/i)).toBeInTheDocument();
    });

    it('blocks STAFF (MEMBER) role from accessing admin-only "/settings/team"', () => {
      useAuthStore.setState({
        isAuthenticated: true,
        isLoading: false,
        role: 'MEMBER',
      });

      render(
        <MemoryRouter initialEntries={['/settings/team']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByText(/403 \/\/ INSUFFICIENT_PERMISSIONS/i)).toBeInTheDocument();
    });

    it('allows ADMIN role to access "/settings/team"', () => {
      useAuthStore.setState({
        isAuthenticated: true,
        isLoading: false,
        role: 'ADMIN',
      });

      render(
        <MemoryRouter initialEntries={['/settings/team']}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /Team Members/i })).toBeInTheDocument();
    });
  });
});
