import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      clientID:
        configService.get<string>('FACEBOOK_APP_ID') || 'not-configured',
      clientSecret:
        configService.get<string>('FACEBOOK_APP_SECRET') || 'not-configured',
      callbackURL: configService.get<string>(
        'FACEBOOK_CALLBACK_URL',
        'http://localhost:3001/auth/facebook/callback',
      ),
      scope: ['email'],
      profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(
        new UnauthorizedException(
          'No email provided by Facebook. Please ensure your Facebook account has a verified email.',
        ),
        false,
      );
    }

    const displayName =
      profile.displayName ||
      [profile.name?.givenName, profile.name?.familyName]
        .filter(Boolean)
        .join(' ') ||
      email.split('@')[0];

    // Facebook does not reliably indicate email verification — treat as unverified for account linking safety
    const result = await this.authService.findOrCreateOAuthUser({
      provider: 'facebook',
      providerId: profile.id,
      email,
      displayName,
      avatarUrl: profile.photos?.[0]?.value,
      emailVerified: false,
    });

    done(null, result);
  }
}
