import { BadRequestError, CustomError } from './custom-error';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    //TODO конфиг модуль
    if (process.env.node_env !== 'production') {
      response.status(500).json({
        error: exception.message,
        stack: exception.stack,
      });
    } else {
      response.status(500).json('kek lol arbedol');
    }
  }
}

@Catch(CustomError)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: CustomError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof BadRequestError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message,
      });
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
