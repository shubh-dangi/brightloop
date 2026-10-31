import { create } from 'zustand';
import {
  UserDto,
  OrganizationDto,
  LoginInput,
  SignupInput,
  AuthResponseData,
  ApiResponse,
} from '@brightloop/contracts';
import { apiClient, setAuthToken, setActiveOrganizationId } from '../services/api';

interface AuthState {
  user: UserDto | null;
  currentOrganization: OrganizationDto | null;
  organizations: OrganizationDto[];
  role: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginInput) => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
  checkAuth: () => Promise<boolean>;
  setUser: (user: UserDto) => void;
  setRole: (role: string) => void;
}

// Fallback initial demo session so the app can be fully explored immediately
const DEMO_USER: UserDto = {
  id: 'usr-demo-owner',
  name: 'Taylor Reed (Owner)',
  email: 'owner@brightloop.local',
  isEmailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEMO_ORG: OrganizationDto = {
  id: 'org-demo-workspace',
  name: 'Brightloop Primary Workspace',
  slug: 'brightloop-primary-workspace',
  createdAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEMO_USER,
  currentOrganization: DEMO_ORG,
  organizations: [DEMO_ORG],
  role: 'OWNER',
  permissions: [
    'org:read',
    'org:update',
    'records:read',
    'records:create',
    'records:update',
    'records:delete',
    'members:read',
    'members:invite',
    'roles:manage',
    'settings:update',
    'audit:read',
    'customers:read',
    'customers:create',
    'customers:update',
    'products:read',
    'products:create',
    'plans:read',
    'plans:create',
    'quotations:read',
    'quotations:create',
    'subscriptions:read',
    'subscriptions:create',
    'invoices:read',
    'payments:read',
    'payments:record',
    'discounts:read',
    'reports:operational',
    'reports:financial',
  ],
  isAuthenticated: true,
  isLoading: false,
  error: null,

  login: async (data: LoginInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', data);
      const authData = response.data.data;

      setAuthToken(authData.tokens.accessToken);
      setActiveOrganizationId(authData.currentOrganization.id);

      set({
        user: authData.user,
        currentOrganization: authData.currentOrganization,
        organizations: authData.organizations,
        role: authData.role,
        permissions: authData.permissions,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend server offline. Setting simulated authenticated session.');
        set({
          user: DEMO_USER,
          currentOrganization: DEMO_ORG,
          organizations: [DEMO_ORG],
          role: 'OWNER',
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
      const message = err.response?.data?.message || err.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  signup: async (data: SignupInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/signup', data);
      const authData = response.data.data;

      setAuthToken(authData.tokens.accessToken);
      setActiveOrganizationId(authData.currentOrganization.id);

      set({
        user: authData.user,
        currentOrganization: authData.currentOrganization,
        organizations: authData.organizations,
        role: authData.role,
        permissions: authData.permissions,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Signup failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
    setAuthToken(null);
    setActiveOrganizationId(null);
    set({
      user: null,
      currentOrganization: null,
      organizations: [],
      role: null,
      permissions: [],
      isAuthenticated: false,
    });
  },

  switchOrganization: (orgId: string) => {
    const org = get().organizations.find((o) => o.id === orgId);
    if (org) {
      setActiveOrganizationId(orgId);
      set({ currentOrganization: org });
    }
  },

  checkAuth: async () => {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/auth/me');
      const data = response.data.data;
      if (data?.user) {
        set({
          user: data.user,
          currentOrganization: data.currentTenant,
          organizations: data.organizations || [data.currentTenant],
          role: data.currentTenant?.role,
          permissions: data.currentTenant?.permissions || [],
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    } catch {
      return get().isAuthenticated;
    }
  },

  setUser: (user: UserDto) => set({ user }),
  setRole: (role: string) => set({ role }),
}));
