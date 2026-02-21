import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Catch()
export class OAuthExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'OAuth authentication failed';

    response.redirect(
      `${frontendUrl}/callback?error=${encodeURIComponent(message)}`,
    );
  }
}
