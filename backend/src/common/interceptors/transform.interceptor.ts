import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  message: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && data.data !== undefined && data.message) {
          return data;
        }

        const request = context.switchToHttp().getRequest();
        const method = request.method;

        let message = 'Operation successful';
        if (method === 'POST') message = 'Resource created successfully';
        if (method === 'GET') message = 'Data retrieved successfully';
        if (method === 'PUT' || method === 'PATCH')
          message = 'Resource updated successfully';
        if (method === 'DELETE') message = 'Resource deleted successfully';

        if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          Object.keys(data).length === 1
        ) {
          return { data: null, message: data.message };
        }

        return {
          data,
          message,
        };
      }),
    );
  }
}
