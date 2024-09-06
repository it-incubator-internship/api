import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

import { ConfigurationType } from '../../../../common/settings/configuration';
import { UserRepository } from '../../user/repository/user.repository';
import { BadRequestError, ForbiddenError } from '../../../../../../common/utils/result/custom-error';

type RecaptchaResponse = {
  success: true | false;
  challenge_ts: string;
  hostname: string;
  action: string;
  score: number;
};

@Injectable()
export class RecaptchaAuthGuard implements CanActivate {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly userRepository: UserRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const recaptchaToken = request.body.recaptchaToken;
    const userEmail = request.body.email;

    if (!recaptchaToken) {
      throw new ForbiddenError('reCAPTCHA token missing');
    }

    await this.checkEmail({ email: userEmail });

    const score = await this.getScore({ recaptchaToken });
    this.checkScore({ score });

    return true;
  }

  private async checkEmail({ email }: { email: string }) {
    if (!email) {
      throw new ForbiddenError('user email missing');
    }

    const user = await this.userRepository.findUserByEmail({ email });

    if (!user) {
      throw new BadRequestError(`User with this email doesn't exist`, [
        {
          message: `User with this email doesn't exist`,
          field: 'email',
        },
      ]);
    }
  }

  private async getScore({ recaptchaToken }: { recaptchaToken: string }): Promise<number> {
    // секретный ключ reCAPTCHA
    const secretKey = this.configService.get('recaptchaSettings.secret', { infer: true });

    const response = await lastValueFrom(
      this.httpService.post<RecaptchaResponse>(`https://www.google.com/recaptcha/api/siteverify`, null, {
        params: {
          secret: secretKey,
          response: recaptchaToken,
        },
      }),
    );

    const { score } = response.data;

    return score;
  }

  private checkScore({ score }: { score: number }) {
    if (!score) {
      throw new ForbiddenError('reCAPTCHA verification failed');
    }

    if (score < 0.9) {
      throw new ForbiddenError('probability that the request was made by a bot');
    }
  }
}
