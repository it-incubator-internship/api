import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

import { BadRequestError, CustomError, ForbiddenError, NotFoundError, UnauthorizedError } from './custom-error';

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
        fields: exception.getError(),
      });
    }

    if (exception instanceof ForbiddenError) {
      return response.status(HttpStatus.FORBIDDEN).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message,
      });
    }

    if (exception instanceof UnauthorizedError) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message,
      });
    }

    if (exception instanceof NotFoundError) {
      return response.status(HttpStatus.NOT_FOUND).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message,
      });
    }
  }
}
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const methodInfo = request.methodInfo || {};

    const status = exception.getStatus();
    const responseError = exception.getResponse() as any;

    if (status === HttpStatus.CREATED) {
      return response.status(status).json(responseError);
    }

    const errorResponse = {
      statusCode: status,
      inTry:
        methodInfo.controllerName && methodInfo.methodName && methodInfo.methodRoute
          ? `${methodInfo.controllerName}.${methodInfo.methodName}, ${methodInfo.methodRoute}`
          : 'HttpException',
      error: responseError.message || responseError,
      errorObj: status === HttpStatus.INTERNAL_SERVER_ERROR ? exception : null,
      info:
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? "Back doesn't know what the error is... ^._.^"
          : 'Check your request! /ᐠ-ꞈ-ᐟ\\',
    };
    response.status(status).json(errorResponse);
  }
}
@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    //TODO конфиг модуль
    if (process.env.node_env !== 'production') {
      response.status(500).json({
        error: exception.message,
        stack: exception.stack,
        more: exception,
      });
    } else {
      response.status(500).json('kek lol arbedol');
    }
  }
}
