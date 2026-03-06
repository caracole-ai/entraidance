import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

function createMockContext(headers: Record<string, string> = {}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as unknown as ExecutionContext;
}

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockResolvedValue({ sub: 'admin' }),
          },
        },
      ],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no cookie header', async () => {
      const ctx = createMockContext({});
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when cookie has no admin_token', async () => {
      const ctx = createMockContext({ cookie: 'other=value' });
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return true for a valid token', async () => {
      const ctx = createMockContext({ cookie: 'admin_token=valid-jwt' });
      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-jwt');
    });

    it('should throw UnauthorizedException for an invalid token', async () => {
      (jwtService.verifyAsync as jest.Mock).mockRejectedValueOnce(
        new Error('invalid'),
      );
      const ctx = createMockContext({ cookie: 'admin_token=bad-jwt' });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
