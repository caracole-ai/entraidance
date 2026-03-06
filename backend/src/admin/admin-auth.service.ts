import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(
    username: string,
    password: string,
  ): Promise<{ token: string }> {
    if (username !== 'admin' || password !== '14111412sisi@!') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.jwtService.signAsync({
      sub: 'admin',
      role: 'admin',
    });

    return { token };
  }
}
