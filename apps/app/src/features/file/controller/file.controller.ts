import * as https from 'https';

import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Delete, HttpCode, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';

import { JwtAuthGuard } from '../../user/auth/guards/jwt.auth.guard';
import { UserIdFromRequest } from '../../user/auth/decorators/controller/userIdFromRequest';
import { UploadAvatarSwagger } from '../decorators/swagger/upload-avatar/upload-avatar.swagger.decorator';
import { ConfigurationType } from '../../../common/settings/configuration';
import { BadRequestError } from '../../../../../common/utils/result/custom-error';
import { UploadAvatarUserCommand } from '../application/command/upload.avatar.user.command';
import { DeleteAvatarSwagger } from '../decorators/swagger/delete-avatar/delete-avatar.swagger.decorator';
import { DeleteAvatarUserCommand } from '../application/command/delete.avatar.user.command';
import { RMQ_CMD } from '../../../../../common/constants/enums';

@ApiTags('file')
@Controller('file')
export class FileController {
  private readonly imageStreamConfiguration: ConfigurationType['fileMicroservice'];

  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private commandBus: CommandBus,
    @Inject('MULTICAST_EXCHANGE') private readonly gatewayProxyClient: ClientProxy,
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
    const result = await this.commandBus.execute(new UploadAvatarUserCommand({ userId }));

    if (!result.isSuccess) {
      throw result.error;
    }

    // если изображение в запросе есть
    const options = {
      rejectUnauthorized: false,
      hostname: this.imageStreamConfiguration.hostname,
      port: this.imageStreamConfiguration.port || 443,
      path: `/api/v1${this.imageStreamConfiguration.avatarPath}${result.value.eventId}/${userId}`,
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type'],
        'Content-Length': req.headers['content-length'],
      },
    };

    return new Promise((resolve, reject) => {
      // Используем https.request вместо http.request
      const forwardRequest = https.request(options, (forwardResponse) => {
        let responseData = '';

        forwardResponse.on('data', (chunk) => {
          responseData += chunk;
        });

        forwardResponse.on('end', () => {
          const contentType = forwardResponse.headers['content-type'];
          if (responseData.length === 0 && forwardResponse.statusCode === 201) {
            return resolve({
              statusCode: forwardResponse.statusCode,
              body: null, // Указываем, что тело пустое, но запрос успешен
            });
          }
          if (contentType && contentType.includes('application/json')) {
            try {
              const parsedResponse = JSON.parse(responseData);
              resolve({
                statusCode: forwardResponse.statusCode,
                body: parsedResponse,
              });
            } catch (error) {
              reject(new Error('Error parsing response from second server'));
            }
          } else {
            resolve({
              statusCode: forwardResponse.statusCode,
              body: responseData,
            });
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
    const result = await this.commandBus.execute(new DeleteAvatarUserCommand({ userId: userInfo.userId }));

    if (result.isSuccess) {
      this.gatewayProxyClient.emit({ cmd: RMQ_CMD.AVATAR_DELETED }, userInfo.userId);
    }

    if (!result.isSuccess) throw result.error;

    return;
  }
}
