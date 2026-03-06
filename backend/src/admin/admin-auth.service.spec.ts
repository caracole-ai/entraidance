import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';

describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AdminAuthService>(AdminAuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const result = await service.login('admin', '14111412sisi@!');

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'admin',
        role: 'admin',
      });
      expect(result).toEqual({ token: 'mock-token' });
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      await expect(service.login('admin', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong username', async () => {
      await expect(
        service.login('wrong', '14111412sisi@!'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
