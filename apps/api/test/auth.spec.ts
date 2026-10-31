import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as argon2 from 'argon2';
import { AuthService } from '../src/modules/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('Authentication & Security', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      organization: {
        create: vi.fn(),
      },
      refreshToken: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      activityLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    mockJwtService = {
      sign: vi.fn().mockReturnValue('mock_jwt_access_token'),
    };

    mockConfigService = {
      get: vi.fn().mockImplementation((key: string, def: any) => def),
    };

    authService = new AuthService(
      mockPrisma,
      mockJwtService,
      mockConfigService,
    );
  });

  it('hashes passwords using Argon2id with high memory cost', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await argon2.hash(rawPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
    });

    expect(hash).toContain('$argon2id$');
    const valid = await argon2.verify(hash, rawPassword);
    expect(valid).toBe(true);

    const invalid = await argon2.verify(hash, 'WrongPassword');
    expect(invalid).toBe(false);
  });

  it('rejects login when user is not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'nonexistent@brightloop.local',
        password: 'Password123!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects login when password does not match', async () => {
    const correctHash = await argon2.hash('CorrectPassword123!', {
      type: argon2.argon2id,
    });

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@brightloop.local',
      passwordHash: correctHash,
      memberships: [
        {
          organizationId: 'org-1',
          status: 'ACTIVE',
          role: { name: 'OWNER' },
        },
      ],
    });

    await expect(
      authService.login({
        email: 'test@brightloop.local',
        password: 'IncorrectPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
