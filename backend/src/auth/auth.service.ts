import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
    });

    const token = this.signToken(user);
    return {
      accessToken: token,
      user: this.sanitizeUser(user),
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return null;
    }

    return user;
  }

  login(user: User) {
    const token = this.signToken(user);
    return {
      accessToken: token,
      user: this.sanitizeUser(user),
    };
  }

  async findOrCreateOAuthUser(profile: {
    provider: string;
    providerId: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
  }) {
    // 1. Check if user already linked with this OAuth provider
    let user = await this.usersService.findByOAuthProvider(profile.provider, profile.providerId);
    if (user) {
      return {
        accessToken: this.signToken(user),
        user: this.sanitizeUser(user),
      };
    }

    // 2. Check if user exists with this email → link OAuth provider
    user = await this.usersService.findByEmail(profile.email);
    if (user) {
      await this.usersService.update(user.id, {
        oauthProvider: profile.provider,
        oauthProviderId: profile.providerId,
        avatarUrl: user.avatarUrl || profile.avatarUrl || null,
      });
      user = (await this.usersService.findOne(user.id))!;
      return {
        accessToken: this.signToken(user),
        user: this.sanitizeUser(user),
      };
    }

    // 3. Create new user (no password)
    user = await this.usersService.create({
      email: profile.email,
      passwordHash: null,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl || null,
      oauthProvider: profile.provider,
      oauthProviderId: profile.providerId,
    });

    return {
      accessToken: this.signToken(user),
      user: this.sanitizeUser(user),
    };
  }

  private signToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  }

  private sanitizeUser(user: User) {
    const { passwordHash, oauthProviderId, ...result } = user;
    return result;
  }
}
