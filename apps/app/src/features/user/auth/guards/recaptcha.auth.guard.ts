import { Request } from 'express';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

import { ConfigurationType } from '../../../../../../app/src/common/settings/configuration';

@Injectable()
export class RecaptchaAuthGuard implements CanActivate {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // получение токена из запроса
    const recaptchaToken = request.body!.recaptchaToken;

    if (!recaptchaToken) {
      console.log('recaptcha token missing');
      throw new ForbiddenException('reCAPTCHA token missing');
    }

    // секретный ключ reCAPTCHA
    // const secretKey = '6LcEBTQqAAAAACXQPvjFv5JaSqeUOVSk3I2AmCkz&response';
    // const secretKey = '6LcEBTQqAAAAACXQPvjFv5JaSqeUOVSk3I2AmCkz';
    const recaptchaSetting = this.configService.get('recaptchaSettings', { infer: true });
    const recaptchaSekret = recaptchaSetting.recaptchaSecret as string;
    const recaptchaURL = recaptchaSetting.recaptchaURL as string;

    const response = await lastValueFrom(
      this.httpService.post(recaptchaURL, null, {
        params: {
          secret: recaptchaSekret,
          response: recaptchaToken,
        },
      }),
    );

    console.log('recaptcha response', response);

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
