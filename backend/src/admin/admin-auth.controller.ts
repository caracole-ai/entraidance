import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AdminAuthService } from './admin-auth.service';

@Controller('admin')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.adminAuthService.login(
      body.username,
      body.password,
    );

    res.cookie('admin_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000,
    });

    return { message: 'ok' };
  }
}
