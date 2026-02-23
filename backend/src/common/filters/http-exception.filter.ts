import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    if (exception instanceof HttpException) {
      const exResponse = exception.getResponse();
      message =
        typeof exResponse === 'object' &&
        exResponse !== null &&
        'message' in exResponse
          ? Array.isArray((exResponse as any).message)
            ? (exResponse as any).message.join(', ')
            : String((exResponse as any).message)
          : exception.message;
    } else {
      message = 'Internal server error';
    }

    // Never leak internal details on 5xx
    if (status >= 500) {
      this.logger.error(
        `${status} Internal Error`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      message = 'Internal server error';
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
