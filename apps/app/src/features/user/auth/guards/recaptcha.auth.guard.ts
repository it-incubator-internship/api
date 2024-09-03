import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RecaptchaAuthGuard implements CanActivate {
  constructor(private readonly httpService: HttpService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // получение токена из запроса
    const recaptchaToken = request.body!.recaptchaToken;

    if (!recaptchaToken) {
      throw new ForbiddenException('reCAPTCHA token missing');
    }

    // секретный ключ reCAPTCHA
    const secretKey = '6LcEBTQqAAAAACXQPvjFv5JaSqeUOVSk3I2AmCkz&response';

    const response = await lastValueFrom(
      this.httpService.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
        params: {
          secret: secretKey,
          response: recaptchaToken,
        },
      }),
    );

    const { score } = response.data;

    if (!score) {
      throw new ForbiddenException('reCAPTCHA verification failed');
    }

    if (score < 0.9) {
      throw new ForbiddenException('probability that the request was made by a bot');
    }

    return true;
  }
}

type RecaptchaResponse = {
  success: true | false;
  challenge_ts: string;
  hostname: string;
  action: string;
  score: number;
};