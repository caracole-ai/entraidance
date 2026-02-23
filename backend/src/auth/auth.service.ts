import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  private readonly bcryptRounds: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.bcryptRounds = parseInt(
      this.configService.get('BCRYPT_ROUNDS', '12'),
      10,
    );
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
    });

    this.logger.log(`User registered: ${user.id}`);
    const token = this.signToken(user);
    return {
      accessToken: token,
      user: this.sanitizeUser(user),
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      this.logger.warn(`Failed login attempt for: ${email}`);
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      this.logger.warn(`Failed login attempt (wrong password) for: ${email}`);
      return null;
    }

    this.logger.log(`User logged in: ${user.id}`);
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
    emailVerified?: boolean;
  }) {
    // 1. Check if user already linked with this OAuth provider
    let user = await this.usersService.findByOAuthProvider(
      profile.provider,
      profile.providerId,
    );
    if (user) {
      this.logger.log(
        `OAuth login (existing link): ${user.id} via ${profile.provider}`,
      );
      return {
        accessToken: this.signToken(user),
        user: this.sanitizeUser(user),
      };
    }

    // 2. Check if user exists with this email → link only if email is verified by provider
    user = await this.usersService.findByEmail(profile.email);
    if (user) {
      if (profile.emailVerified === false) {
        this.logger.warn(
          `OAuth account linking blocked (unverified email): ${profile.email} via ${profile.provider}`,
        );
        throw new UnauthorizedException(
          'An account with this email already exists. Please log in with your password, then link your social account from your profile.',
        );
      }

      await this.usersService.update(user.id, {
        oauthProvider: profile.provider,
        oauthProviderId: profile.providerId,
        avatarUrl: user.avatarUrl || profile.avatarUrl || null,
      });
      user = (await this.usersService.findOne(user.id))!;
      this.logger.log(
        `OAuth account linked: ${user.id} via ${profile.provider}`,
      );
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

    this.logger.log(`OAuth user created: ${user.id} via ${profile.provider}`);
    return {
      accessToken: this.signToken(user),
      user: this.sanitizeUser(user),
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, this.bcryptRounds);
    await this.usersService.update(userId, { passwordHash });
    this.logger.log(`Password changed for user: ${userId}`);
  }

  private signToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  }

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, oauthProviderId, ...result } = user;
    return result;
  }
}
