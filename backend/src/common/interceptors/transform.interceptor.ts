import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface ResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta: {
    timestamp: string;
    [key: string]: any;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseEnvelope<T>> {
    return next.handle().pipe(
      map((resData) => {
        // If data is already an envelope, return as-is
        if (resData && typeof resData === "object" && "success" in resData && "data" in resData) {
          return resData;
        }

        return {
          success: true,
          message: "Request completed successfully",
          data: resData,
          meta: {
            timestamp: new Date().toISOString(),
          },
        };
      })
    );
  }
}

