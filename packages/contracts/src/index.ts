import { z } from 'zod';

// ============================================================================
// Standard API Envelope
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiMeta {
  timestamp: string;
  pagination?: PaginationMeta;
  [key: string]: unknown;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Role & Permission Definitions
// ============================================================================

export enum SystemRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export enum PermissionKey {
  // Org
  ORG_READ = 'org:read',
  ORG_UPDATE = 'org:update',
  ORG_DELETE = 'org:delete',
  // Members
  MEMBERS_READ = 'members:read',
  MEMBERS_INVITE = 'members:invite',
  MEMBERS_UPDATE = 'members:update',
  MEMBERS_REMOVE = 'members:remove',
  // Roles
  ROLES_MANAGE = 'roles:manage',
  // Records (Generic SaaS entities)
  RECORDS_READ = 'records:read',
  RECORDS_CREATE = 'records:create',
  RECORDS_UPDATE = 'records:update',
  RECORDS_DELETE = 'records:delete',
  // Settings & System
  SETTINGS_UPDATE = 'settings:update',
  AUDIT_READ = 'audit:read',
}

// ============================================================================
// Authentication & User Contracts
// ============================================================================

export const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters').optional(),
});

export type SignupInput = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().or(z.literal('')).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain a number'),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  createdAt: string;
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  SUSPENDED = 'SUSPENDED',
}

export interface MemberDto {
  id: string;
  userId: string;
  user: UserDto;
  roleId: string;
  roleName: string;
  status: MemberStatus | 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  joinedAt: string;
}

export interface RoleDto {
  id: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  permissions: string[];
}

export interface AuthResponseData {
  user: UserDto;
  currentOrganization: OrganizationDto;
  organizations: OrganizationDto[];
  role: string;
  permissions: string[];
  tokens: AuthTokens;
}

// ============================================================================
// Generic Record Contracts (Neutral SaaS Item CRUD)
// ============================================================================

export enum RecordStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum RecordPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export const CreateRecordSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(RecordStatus).default(RecordStatus.DRAFT),
  priority: z.nativeEnum(RecordPriority).default(RecordPriority.MEDIUM),
  category: z.string().min(1, 'Category is required').max(50),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateRecordInput = z.infer<typeof CreateRecordSchema>;

export const UpdateRecordSchema = CreateRecordSchema.partial();

export type UpdateRecordInput = z.infer<typeof UpdateRecordSchema>;

export interface GenericRecordDto {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  status: RecordStatus;
  priority: RecordPriority;
  category: string;
  tags: string[];
  metadata?: Record<string, unknown> | null;
  createdById: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Notification Contracts
// ============================================================================

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM',
}

export interface NotificationDto {
  id: string;
  organizationId: string;
  userId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

// ============================================================================
// Activity Log Contracts
// ============================================================================

export interface ActivityLogDto {
  id: string;
  organizationId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  createdAt: string;
}

// ============================================================================
// Preferences & Settings Contracts
// ============================================================================

export interface UserPreferencesDto {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  density: 'compact' | 'comfortable';
  language: string;
  timezone: string;
  dateFormat: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  marketingEmails: boolean;
}

export interface OrganizationSettingsDto {
  displayName: string;
  supportEmail?: string | null;
  timezone: string;
  dateFormat: string;
  allowMemberInvites: boolean;
  enforce2FA: boolean;
}
