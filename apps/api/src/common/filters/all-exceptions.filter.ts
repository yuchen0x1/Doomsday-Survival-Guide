import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

/** 统一错误响应：{ code, message } */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ method: string; url: string }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
        code = HttpStatus[status] ?? 'ERROR';
      } else if (body && typeof body === 'object') {
        const obj = body as Record<string, unknown>;
        code = typeof obj.code === 'string' ? obj.code : String(status);
        message =
          typeof obj.message === 'string'
            ? obj.message
            : Array.isArray(obj.message)
              ? obj.message.join('; ')
              : exception.message;
      }
    } else if (exception instanceof Error) {
      // 非 HttpException 的 5xx 只记录服务端日志，响应保持通用文案，避免泄露栈/数据库细节。
      this.logger.error(
        `${request.method} ${request.url} -> ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(`${request.method} ${request.url} -> 未知异常`);
    }

    response.status(status).json({ code, message });
  }
}
