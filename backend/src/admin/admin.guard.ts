import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const cookieHeader = request.headers['cookie'];
    if (!cookieHeader) {
      throw new UnauthorizedException('No admin token');
    }

    const token = this.parseCookie(cookieHeader, 'admin_token');
    if (!token) {
      throw new UnauthorizedException('No admin token');
    }

    try {
      await this.jwtService.verifyAsync(token);
      return true;
    } catch {
      throw new UnauthorizedException('Invalid admin token');
    }
  }

  private parseCookie(cookieHeader: string, name: string): string | null {
    const match = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`));
    return match ? match.split('=').slice(1).join('=') : null;
  }
}
