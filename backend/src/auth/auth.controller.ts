import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UseFilters,
  Request,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LocalAuthGuard } from '../common/guards/local-auth.guard.js';
import { GoogleAuthGuard } from '../common/guards/google-auth.guard.js';
import { FacebookAuthGuard } from '../common/guards/facebook-auth.guard.js';
import { OAuthExceptionFilter } from '../common/filters/oauth-exception.filter.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  googleCallback(@Request() req: any, @Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const { accessToken } = req.user;
    res.redirect(`${frontendUrl}/callback?token=${accessToken}`);
  }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  facebookAuth() {
    // Guard redirects to Facebook
  }

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  facebookCallback(@Request() req: any, @Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const { accessToken } = req.user;
    res.redirect(`${frontendUrl}/callback?token=${accessToken}`);
  }
}
