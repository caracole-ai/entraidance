import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Catch()
export class OAuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('OAuthException');

  constructor(private readonly configService: ConfigService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    // Log the real error server-side
    this.logger.error(
      'OAuth authentication error',
      exception?.message || exception,
    );

    // Return a generic message to the user
    const safeMessage = 'OAuth authentication failed';

    response.redirect(
      `${frontendUrl}/callback?error=${encodeURIComponent(safeMessage)}`,
    );
  }
}
