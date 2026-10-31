import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : null;

    let message = 'An unexpected internal server error occurred';
    let details: unknown = null;

    const isDbUnavailable =
      (exception as any)?.name === 'PrismaClientInitializationError' ||
      (exception as any)?.constructor?.name === 'PrismaClientInitializationError' ||
      ((exception as any)?.message &&
        typeof (exception as any).message === 'string' &&
        ((exception as any).message.includes("Can't reach database server") ||
         (exception as any).message.includes('PrismaClientInitializationError')));

    if (isDbUnavailable) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database unavailable';
      details = null;
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const res = exceptionResponse as Record<string, unknown>;
      message = (res.message as string) || (res.error as string) || message;
      details = res.details || (Array.isArray(res.message) ? res.message : null);
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Mask internal error details in production to avoid leaking database schema/stack
    if (status >= 500 && process.env.NODE_ENV === 'production') {
      message = 'An unexpected internal server error occurred';
      details = null;
    }

    // Structured logging for debugging
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - Status: ${status} - Error: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? message[0] : message,
      data: null,
      error: {
        statusCode: status,
        error: HttpStatus[status] || 'Error',
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
