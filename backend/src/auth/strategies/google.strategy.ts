import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      clientID:
        configService.get<string>('GOOGLE_CLIENT_ID') || 'not-configured',
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') || 'not-configured',
      callbackURL: configService.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:3001/auth/google/callback',
      ),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    console.log('[GoogleStrategy] validate() called');
    console.log('[GoogleStrategy] profile:', JSON.stringify(profile, null, 2));

    const email = profile.emails?.[0]?.value;
    if (!email) {
      console.error('[GoogleStrategy] No email in profile');
      return done(
        new UnauthorizedException('No email provided by Google'),
        false,
      );
    }

    // Google emails are always verified
    const emailVerified = profile.emails?.[0]?.verified !== false;
    console.log('[GoogleStrategy] Creating/finding user with email:', email);

    try {
      const result = await this.authService.findOrCreateOAuthUser({
        provider: 'google',
        providerId: profile.id,
        email,
        displayName: profile.displayName || email.split('@')[0],
        avatarUrl: profile.photos?.[0]?.value,
        emailVerified,
      });

      console.log('[GoogleStrategy] Success, user:', result.user.id);
      done(null, result);
    } catch (error) {
      console.error('[GoogleStrategy] Error in findOrCreateOAuthUser:', error);
      done(error, false);
    }
  }
}
