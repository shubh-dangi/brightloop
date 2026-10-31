import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface RoleGuardProps {
  allowedRoles: string[];
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { role, isLoading } = useAuthStore();

  if (isLoading) {
    return null;
  }

  const userRole = (role || '').toUpperCase();
  const isAllowed = allowedRoles.map((r) => r.toUpperCase()).includes(userRole);

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
