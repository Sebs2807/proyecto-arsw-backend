// src/common/interceptors/response.interceptor.ts (CORREGIDO)
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const shouldNotUnwrap =
          data && typeof data === 'object' && ('meta' in data || 'message' in data);

        const payload = shouldNotUnwrap ? data : (data?.data ?? data);

        return {
          status: 'success',
          message: data?.message || 'Operación exitosa',
          data: payload,
        };
      }),
      catchError((error) => {
        throw error;
      }),
    );
  }
}
