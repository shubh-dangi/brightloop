import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@brightloop/contracts';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((resData) => {
        // If data is already in standard ApiResponse structure, return as is
        if (
          resData &&
          typeof resData === 'object' &&
          'success' in resData &&
          'data' in resData
        ) {
          return resData;
        }

        // Check if response has pagination or meta attached
        let data = resData;
        let meta: Record<string, unknown> = {
          timestamp: new Date().toISOString(),
        };
        let message = 'Operation completed successfully';

        if (
          resData &&
          typeof resData === 'object' &&
          'items' in resData &&
          'meta' in resData
        ) {
          data = resData.items;
          meta = {
            ...meta,
            pagination: resData.meta,
          };
        } else if (
          resData &&
          typeof resData === 'object' &&
          'message' in resData &&
          'data' in resData
        ) {
          message = resData.message as string;
          data = resData.data;
          if (resData.meta) {
            meta = { ...meta, ...(resData.meta as object) };
          }
        }

        return {
          success: true,
          message,
          data,
          meta,
        };
      }),
    );
  }
}
