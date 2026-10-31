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
  CUSTOMER = 'CUSTOMER',
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

  // Domain Permissions - Customers
  CUSTOMERS_READ = 'customers:read',
  CUSTOMERS_CREATE = 'customers:create',
  CUSTOMERS_UPDATE = 'customers:update',
  CUSTOMERS_DELETE = 'customers:delete',
  // Products & Variants
  PRODUCTS_READ = 'products:read',
  PRODUCTS_CREATE = 'products:create',
  PRODUCTS_UPDATE = 'products:update',
  PRODUCTS_DELETE = 'products:delete',
  // Plans
  PLANS_READ = 'plans:read',
  PLANS_CREATE = 'plans:create',
  PLANS_UPDATE = 'plans:update',
  PLANS_DELETE = 'plans:delete',
  // Quotations
  QUOTATIONS_READ = 'quotations:read',
  QUOTATIONS_CREATE = 'quotations:create',
  QUOTATIONS_UPDATE = 'quotations:update',
  QUOTATIONS_CONFIRM = 'quotations:confirm',
  QUOTATIONS_CANCEL = 'quotations:cancel',
  // Subscriptions
  SUBSCRIPTIONS_READ = 'subscriptions:read',
  SUBSCRIPTIONS_CREATE = 'subscriptions:create',
  SUBSCRIPTIONS_UPDATE = 'subscriptions:update',
  SUBSCRIPTIONS_PAUSE = 'subscriptions:pause',
  SUBSCRIPTIONS_CLOSE = 'subscriptions:close',
  SUBSCRIPTIONS_RENEW = 'subscriptions:renew',
  // Invoices
  INVOICES_READ = 'invoices:read',
  INVOICES_CONFIRM = 'invoices:confirm',
  INVOICES_CANCEL = 'invoices:cancel',
  INVOICES_SEND = 'invoices:send',
  // Taxes & Discounts
  TAXES_MANAGE = 'taxes:manage',
  DISCOUNTS_READ = 'discounts:read',
  DISCOUNTS_MANAGE = 'discounts:manage',
  DISCOUNTS_APPLY = 'discounts:apply',
  // Payments
  PAYMENTS_READ = 'payments:read',
  PAYMENTS_RECORD = 'payments:record',
  // Reports
  REPORTS_OPERATIONAL = 'reports:operational',
  REPORTS_FINANCIAL = 'reports:financial',
}

// ============================================================================
// Authentication & User Contracts
// ============================================================================

export const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(9, 'Password must be more than 8 characters (minimum 9)')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
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
    .min(9, 'Password must be more than 8 characters (minimum 9)')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
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
    .min(9, 'Password must be more than 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
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
// Customer Contracts
// ============================================================================

export const CreateCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;

export const UpdateCustomerSchema = CreateCustomerSchema.partial();
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;

export interface CustomerDto {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions?: number;
    quotations?: number;
    invoices?: number;
  };
}

// ============================================================================
// Product & Variant Contracts
// ============================================================================

export const CreateProductVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  additionalPrice: z.number().min(0, 'Additional price must be non-negative'),
});

export type CreateProductVariantInput = z.infer<typeof CreateProductVariantSchema>;

export const CreateProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  type: z.string().min(1, 'Product type is required'),
  salesPrice: z.number().min(0, 'Sales price must be positive'),
  costPrice: z.number().min(0, 'Cost price must be positive').optional(),
  notes: z.string().optional(),
  variants: z.array(CreateProductVariantSchema).optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export interface ProductVariantDto {
  id: string;
  productId: string;
  name: string;
  additionalPrice: number;
}

export interface ProductDto {
  id: string;
  organizationId: string;
  name: string;
  type: string;
  salesPrice: number;
  costPrice?: number | null; // Masked for Staff
  notes?: string | null;
  variants: ProductVariantDto[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Subscription Plan Contracts
// ============================================================================

export enum BillingFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export const CreatePlanSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters'),
  productId: z.string().uuid('Invalid product ID'),
  price: z.number().min(0, 'Plan price must be positive'),
  billingFrequency: z.nativeEnum(BillingFrequency),
  minQuantity: z.number().int().min(1, 'Minimum quantity must be at least 1').default(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  autoCloseOnEnd: z.boolean().default(false),
  allowEarlyClose: z.boolean().default(true),
  allowPause: z.boolean().default(true),
  allowRenewal: z.boolean().default(true),
});

export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;

export interface PlanDto {
  id: string;
  organizationId: string;
  productId: string;
  product?: ProductDto;
  name: string;
  price: number;
  billingFrequency: BillingFrequency;
  minQuantity: number;
  startDate?: string | null;
  endDate?: string | null;
  autoCloseOnEnd: boolean;
  allowEarlyClose: boolean;
  allowPause: boolean;
  allowRenewal: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Quotation Contracts
// ============================================================================

export enum QuotationStatus {
  DRAFT = 'DRAFT',
  QUOTATION = 'QUOTATION',
  CONFIRMED = 'CONFIRMED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export const QuotationLineInputSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  taxRate: z.number().min(0).default(0),
});

export const CreateQuotationSchema = z.object({
  customerId: z.string().uuid('Customer is required'),
  templateName: z.string().optional(),
  validDays: z.number().int().min(1).default(15),
  notes: z.string().optional(),
  lines: z.array(QuotationLineInputSchema).min(1, 'At least one line item is required'),
});

export type CreateQuotationInput = z.infer<typeof CreateQuotationSchema>;

export interface QuotationLineDto {
  id: string;
  quotationId: string;
  productId: string;
  productName: string;
  variantId?: string | null;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

export interface QuotationDto {
  id: string;
  organizationId: string;
  quotationNumber: string;
  customerId: string;
  customer?: CustomerDto;
  templateName?: string | null;
  validDays: number;
  expiryDate: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: QuotationStatus;
  notes?: string | null;
  lines: QuotationLineDto[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Subscription Contracts
// ============================================================================

export enum SubscriptionStatus {
  DRAFT = 'DRAFT',
  QUOTATION = 'QUOTATION',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
}

export const CreateSubscriptionSchema = z.object({
  customerId: z.string().uuid('Customer is required'),
  planId: z.string().uuid('Plan is required'),
  quotationId: z.string().uuid().optional().nullable(),
  startDate: z.string(),
  expiryDate: z.string().optional().nullable(),
  paymentTerms: z.string().default('Net 30'),
  lines: z.array(QuotationLineInputSchema).min(1, 'At least one line item is required'),
});

export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;

export interface SubscriptionLineDto {
  id: string;
  subscriptionId: string;
  productId: string;
  productName: string;
  variantId?: string | null;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

export interface SubscriptionDto {
  id: string;
  organizationId: string;
  subscriptionNumber: string;
  customerId: string;
  customer?: CustomerDto;
  planId: string;
  plan?: PlanDto;
  quotationId?: string | null;
  startDate: string;
  expiryDate?: string | null;
  billingFrequency: BillingFrequency;
  paymentTerms: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: SubscriptionStatus;
  lines: SubscriptionLineDto[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Invoice Contracts
// ============================================================================

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export interface InvoiceLineDto {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

export interface InvoiceDto {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  subscriptionId?: string | null;
  customerId: string;
  customer?: CustomerDto;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  lines: InvoiceLineDto[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Discount Contracts
// ============================================================================

export enum DiscountType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export enum DiscountScope {
  WHOLE_SUBSCRIPTION = 'WHOLE_SUBSCRIPTION',
  SPECIFIC_PRODUCTS = 'SPECIFIC_PRODUCTS',
}

export const CreateDiscountSchema = z.object({
  name: z.string().min(2, 'Discount name is required'),
  code: z.string().min(3, 'Discount code is required').toUpperCase(),
  type: z.nativeEnum(DiscountType),
  value: z.number().min(0.01, 'Value must be positive'),
  minPurchase: z.number().min(0).default(0),
  minQuantity: z.number().int().min(0).default(0),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  maxUsage: z.number().int().min(1).optional().nullable(),
  scope: z.nativeEnum(DiscountScope).default(DiscountScope.WHOLE_SUBSCRIPTION),
  applicableProductIds: z.array(z.string().uuid()).default([]),
});

export type CreateDiscountInput = z.infer<typeof CreateDiscountSchema>;

export interface DiscountDto {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  type: DiscountType;
  value: number;
  minPurchase: number;
  minQuantity: number;
  startDate?: string | null;
  endDate?: string | null;
  maxUsage?: number | null;
  usedCount: number;
  scope: DiscountScope;
  applicableProductIds: string[];
  createdAt: string;
}

// ============================================================================
// Payment Contracts
// ============================================================================

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  CHECK = 'CHECK',
  CASH = 'CASH',
  OTHER = 'OTHER',
}

export const RecordPaymentSchema = z.object({
  invoiceId: z.string().uuid('Invoice is required'),
  amount: z.number().min(0.01, 'Amount must be greater than zero'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentDate: z.string(),
  note: z.string().optional(),
});

export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;

export interface PaymentDto {
  id: string;
  organizationId: string;
  paymentReference: string;
  invoiceId: string;
  invoice?: InvoiceDto;
  customerId: string;
  customer?: CustomerDto;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  note?: string | null;
  recordedById: string;
  recordedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

// ============================================================================
// Operational Dashboard & Report Metrics
// ============================================================================

export interface StaffDashboardMetrics {
  totalCustomers: number;
  activeSubscriptions: number;
  quotationsPending: number;
  invoicesDue: number;
  invoicesOverdue: number;
  paymentsCollectedThisMonth: number;
  upcomingRenewals: number;
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
