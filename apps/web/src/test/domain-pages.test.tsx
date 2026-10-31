import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RoleGuard } from '../routes/RoleGuard';
import { useAuthStore } from '../stores/authStore';
import { SubscriptionsListPage } from '../pages/subscriptions/SubscriptionsListPage';
import { InvoicesListPage } from '../pages/invoices/InvoicesListPage';
import { QuotationsListPage } from '../pages/quotations/QuotationsListPage';
import { PlansListPage } from '../pages/plans/PlansListPage';

describe('Domain Pages & Navigation Guards', () => {
  it('renders SubscriptionsListPage with headers and demo subscriptions table', async () => {
    render(
      <MemoryRouter>
        <SubscriptionsListPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Subscription Contracts/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by subscription number or customer/i)).toBeInTheDocument();
  });

  it('renders InvoicesListPage with billing table and status filters', async () => {
    render(
      <MemoryRouter>
        <InvoicesListPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Invoices & Recurring Billing/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search invoice number or customer name/i)).toBeInTheDocument();
  });

  it('renders QuotationsListPage with commercial offers and status tabs', async () => {
    render(
      <MemoryRouter>
        <QuotationsListPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Commercial Quotations/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search quotation/i)).toBeInTheDocument();
  });

  it('renders PlansListPage with recurring plans and billing periods', async () => {
    render(
      <MemoryRouter>
        <PlansListPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Subscription Plans/i })).toBeInTheDocument();
  });

  it('RoleGuard: blocks MEMBER from accessing OWNER/ADMIN route and redirects to /unauthorized', () => {
    useAuthStore.setState({
      role: 'MEMBER',
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin-only']}>
        <Routes>
          <Route element={<RoleGuard allowedRoles={['OWNER', 'ADMIN']} />}>
            <Route path="/admin-only" element={<div>Admin Secret Zone</div>} />
          </Route>
          <Route path="/unauthorized" element={<div>Access Denied 403</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Access Denied 403/i)).toBeInTheDocument();
    expect(screen.queryByText(/Admin Secret Zone/i)).not.toBeInTheDocument();
  });

  it('RoleGuard: permits ADMIN to access OWNER/ADMIN route', () => {
    useAuthStore.setState({
      role: 'ADMIN',
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin-only']}>
        <Routes>
          <Route element={<RoleGuard allowedRoles={['OWNER', 'ADMIN']} />}>
            <Route path="/admin-only" element={<div>Admin Secret Zone</div>} />
          </Route>
          <Route path="/unauthorized" element={<div>Access Denied 403</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Admin Secret Zone/i)).toBeInTheDocument();
  });
});
