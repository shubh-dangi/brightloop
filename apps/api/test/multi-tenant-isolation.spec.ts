import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecordsService } from '../src/modules/records/records.service';
import { TenantGuard } from '../src/common/guards/tenant.guard';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('Multi-Tenant Isolation Architecture', () => {
  let recordsService: RecordsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      genericRecord: {
        findMany: vi.fn(),
        count: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      activityLog: {
        create: vi.fn(),
      },
    };

    recordsService = new RecordsService(mockPrisma);
  });

  it('enforces tenant isolation: list query strictly filters by organizationId', async () => {
    mockPrisma.genericRecord.count.mockResolvedValue(1);
    mockPrisma.genericRecord.findMany.mockResolvedValue([
      {
        id: 'rec-1',
        organizationId: 'org-tenant-A',
        title: 'Tenant A Record',
        status: 'ACTIVE',
        priority: 'HIGH',
        category: 'Core',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: 'user-1',
      },
    ]);

    const result = await recordsService.findAll('org-tenant-A', {});

    expect(mockPrisma.genericRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: 'org-tenant-A',
        }),
      }),
    );
    expect(result.items[0]?.organizationId).toBe('org-tenant-A');
  });

  it('enforces tenant isolation: denies reading a record belonging to another tenant', async () => {
    // Record exists in DB, but under 'org-tenant-A'
    mockPrisma.genericRecord.findFirst.mockResolvedValue(null);

    // Tenant B attempts to read Tenant A's record
    await expect(
      recordsService.findOne('org-tenant-B', 'rec-belonging-to-tenant-A'),
    ).rejects.toThrow(NotFoundException);

    expect(mockPrisma.genericRecord.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'rec-belonging-to-tenant-A',
        organizationId: 'org-tenant-B',
      },
      include: expect.any(Object),
    });
  });

  it('enforces tenant isolation: denies updating or deleting a record of another tenant', async () => {
    mockPrisma.genericRecord.findFirst.mockResolvedValue(null);

    await expect(
      recordsService.update('org-tenant-B', 'user-2', 'rec-tenant-A', {
        title: 'Malicious Overwrite',
      }),
    ).rejects.toThrow(NotFoundException);

    await expect(
      recordsService.remove('org-tenant-B', 'user-2', 'rec-tenant-A'),
    ).rejects.toThrow(NotFoundException);
  });

  it('TenantGuard blocks access if user is not an active member of requested organization', () => {
    const reflector = new Reflector();
    const guard = new TenantGuard(reflector);

    const mockExecutionContext: any = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-organization-id': 'org-unauthorized-target',
          },
          user: {
            id: 'user-attacker',
            memberships: [
              {
                organizationId: 'org-legitimate-home',
                status: 'ACTIVE',
                role: { name: 'OWNER' },
              },
            ],
          },
        }),
      }),
    };

    expect(() => guard.canActivate(mockExecutionContext)).toThrow(
      ForbiddenException,
    );
  });

  it('TenantGuard accepts and sets tenant context when user is a verified member', () => {
    const reflector = new Reflector();
    const guard = new TenantGuard(reflector);

    const requestObj: any = {
      headers: {
        'x-organization-id': 'org-legitimate-home',
      },
      user: {
        id: 'user-valid',
        memberships: [
          {
            organizationId: 'org-legitimate-home',
            organization: { name: 'Legitimate Org', slug: 'legitimate-org' },
            status: 'ACTIVE',
            role: {
              name: 'OWNER',
              permissions: [{ permission: { key: 'records:read' } }],
            },
          },
        ],
      },
    };

    const mockExecutionContext: any = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => requestObj,
      }),
    };

    const allowed = guard.canActivate(mockExecutionContext);
    expect(allowed).toBe(true);
    expect(requestObj.currentTenant).toBeDefined();
    expect(requestObj.currentTenant.id).toBe('org-legitimate-home');
    expect(requestObj.currentTenant.role).toBe('OWNER');
    expect(requestObj.currentTenant.permissions).toContain('records:read');
  });
});
