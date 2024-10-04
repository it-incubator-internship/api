import * as https from 'https';

import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Delete, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';

import { JwtAuthGuard } from '../../user/auth/guards/jwt.auth.guard';
import { UserIdFromRequest } from '../../user/auth/decorators/controller/userIdFromRequest';
import { UploadAvatarSwagger } from '../decorators/swagger/upload-avatar/upload-avatar.swagger.decorator';
import { ConfigurationType } from '../../../common/settings/configuration';
import { BadRequestError } from '../../../../../common/utils/result/custom-error';
import { UploadAvatarUserCommand } from '../application/command/upload.avatar.user.command';
import { DeleteAvatarSwagger } from '../decorators/swagger/delete-avatar/delete-avatar.swagger.decorator';
import { DeleteAvatarUserCommand } from '../application/command/delete.avatar.user.command';

@ApiTags('file')
@Controller('file')
export class FileController {
  private readonly imageStreamConfiguration: ConfigurationType['fileMicroservice'];

  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private commandBus: CommandBus,
  ) {
    this.imageStreamConfiguration = this.configService.get<ConfigurationType['fileMicroservice']>('fileMicroservice', {
      infer: true,
    }) as ConfigurationType['fileMicroservice'];
  }

  @UseGuards(JwtAuthGuard)
  @Post('/avatar')
  @HttpCode(204)
  @UploadAvatarSwagger()
  async uploadAvatar(
    @UserIdFromRequest() userInfo: { userId: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // проверка запроса на наличие изображения
    const contentType = req.headers['content-type'];

    // если в запросе нет изображения
    if (!contentType) {
      console.log('!contentType');
      throw new BadRequestError('Photo not included in request.', [{ message: 'string', field: 'string' }]);
    }

    // получение userId для использования в options
    const userId = userInfo.userId;

    // получение данных от второго микросервиса
    await this.streamAvatarToFileMicroservice(req, res, userId);

    return;
  }

  private async streamAvatarToFileMicroservice(
    req: Request,
    res: Response,
    userId: string,
  ): Promise<{ statusCode: number | undefined; body: any }> {
    console.log('console.log in app-file controller (streamAvatarToFileMicroservice)');
    const result = await this.commandBus.execute(new UploadAvatarUserCommand({ userId }));
    console.log('result in app-file controller:', result);

    if (!result.isSuccess) {
      console.log('!result.isSuccess in app-file controller');
      throw result.error;
    }

    // если изображение в запросе есть
    const options = {
      rejectUnauthorized: false,
      hostname: this.imageStreamConfiguration.hostname,
      port: this.imageStreamConfiguration.port || 443, // Используем HTTPS порт
      path: `/api/v1${this.imageStreamConfiguration.avatarPath}${result.value.eventId}/${userId}`,
      method: 'POST',
      headers: {
        ...req.headers,
      },
    };
    console.log('options in app-file controller:', options);

    return new Promise((resolve, reject) => {
      // Используем https.request вместо http.request
      const forwardRequest = https.request(options, (forwardResponse) => {
        let responseData = '';
        console.log('responseData in app-file controller:', responseData);

        forwardResponse.on('data', (chunk) => {
          responseData += chunk;
        });

        forwardResponse.on('end', () => {
          try {
            resolve({
              statusCode: forwardResponse.statusCode,
              body: responseData,
            });
          } catch (error) {
            console.error('Error parsing response from second server:', error);
            reject(new Error('Error parsing response from second server'));
          }
        });
      });

      forwardRequest.on('error', (err) => {
        console.error('Error with request to second server:', err);
        reject(err);
      });

      req.on('data', (chunk) => {
        forwardRequest.write(chunk);
      });

      req.on('end', () => {
        forwardRequest.end();
      });
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/avatar')
  @DeleteAvatarSwagger()
  async deleteAvatar(@UserIdFromRequest() userInfo: { userId: string }) {
    console.log('userInfo.userId in app.file.controller(deleteAvatar):', userInfo.userId);

    const result = await this.commandBus.execute(new DeleteAvatarUserCommand({ userId: userInfo.userId }));
    console.log('result in app.file.controller(deleteAvatar):', result);

    if (!result.isSuccess) throw result.error;

    return;
  }
}
