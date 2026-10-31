import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response, Request } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = "Internal Server Error";
    let detail = "An unexpected error occurred.";
    let code = "INTERNAL_SERVER_ERROR";
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();

      if (typeof res === "string") {
        detail = res;
      } else if (typeof res === "object" && res !== null) {
        detail = res.message || res.error || detail;
        code = res.error ? res.error.toUpperCase().replace(/\s+/g, "_") : `HTTP_${status}`;
        if (Array.isArray(res.message)) {
          errors = res.message;
          detail = "Validation failed for incoming request parameters.";
          code = "VALIDATION_ERROR";
          title = "Validation Failed";
        }
      }
      title = exception.name || title;
    } else if (exception instanceof Error) {
      detail = exception.message;
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    }

    // RFC 7807 Problem Details
    response.status(status).json({
      type: "https://tools.ietf.org/html/rfc7807",
      title,
      status,
      code,
      detail,
      instance: request.url,
      timestamp: new Date().toISOString(),
      ...(errors ? { errors } : {}),
    });
  }
}

