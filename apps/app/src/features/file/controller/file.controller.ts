import * as http from 'http';

import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';

import { BadRequestError } from '../../../../../common/utils/result/custom-error';
import { JwtAuthGuard } from '../../user/auth/guards/jwt.auth.guard';
import { UserIdFromRequest } from '../../user/auth/decorators/controller/userIdFromRequest';
import { UploadAvatarSwagger } from '../decorators/swagger/upload-avatar/upload-avatar.swagger.decorator';
import { ConfigurationType } from '../../../../../app/src/common/settings/configuration';
// import { DeleteAvatarSwagger } from '../decorators/swagger/delete-avatar/delete-avatar.swagger.decorator';
// import { DeleteAvatarUserCommand } from '../application/command/delete.avatar.user.command';

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

  // это первоначальный код. оставил его из-за примера валидации. в целом, он не нужен.
  // @UseGuards(JwtAuthGuard)
  // @Post(':id/avatar')
  // @UseInterceptors(FileInterceptor('file'))
  // // @UpdateUserProfileSwagger()
  // async uploadAvatar(
  //   @UploadedFile(
  //     new ParseFilePipeBuilder()
  //       .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
  //       .addMaxSizeValidator({ maxSize: maxAvatarSize })
  //       .build({
  //         exceptionFactory: () => {
  //           throw new BadRequestError('The photo size is more than 10 MB or the format is not JPEG or PNG', [
  //             {
  //               message: 'The photo must be less than 10 Mb and have JPEG or PNG format',
  //               field: '',
  //             },
  //           ]);
  //         },
  //       }),
  //   )
  //   file: Express.Multer.File,
  //   @Param('id', ParseUUIDPipe) userIdFromParam: string,
  // ) {
  //   console.log('console.log in file controller');
  //   console.log('file in file controller:', file);
  //   console.log('userIdFromParam in file controller:', userIdFromParam);

  //   const metadata = await sharp(file.buffer).metadata();
  //   console.log('metadata in file controller:', metadata);

  //   const convertedImage = await sharp(file.buffer).webp({ quality: 70 }).toBuffer();
  //   console.log('convertedImage in file controller:', convertedImage);

  //   const convertedImageMetadata = await sharp(convertedImage).metadata();
  //   console.log('convertedImageMetadata in file controller:', convertedImageMetadata);
  // }

  @UseGuards(JwtAuthGuard)
  @Post('/avatar')
  @UploadAvatarSwagger()
  async uploadAvatar(
    @UserIdFromRequest() userInfo: { userId: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // получение userId для использования в options
    const userId = userInfo.userId;

    const { statusCode, body } = await this.test(req, res, userId);
    console.log('statusCode in app.file.controller:', statusCode);
    console.log('body in app.file.controller:', body);

    //user case для добалвения url
    // const result = await this.commandBus.execute(new AddAvatarUserCommand({ userId: userInfo.userId, avatarUrl }));
    // console.log('result in file controller v1 (uploadAvatar):', result);

    return body;
  }

  //возвращает ответ с того бэкэнда
  private async test(req: Request, res: Response, userId: string) {
    // проверка запроса на наличие изображения
    const contentType = req.headers['content-type'];
    console.log('contentType in app.file.controller:', contentType);

    if (!contentType) {
      console.log('!contentType');
      throw new BadRequestError('Photo not included in request.', [
        {
          message: 'Photo not included in request. Form-data is missing.',
          field: '',
        },
      ]);
    }

    const options = {
      hostname: this.imageStreamConfiguration.hostname,
      port: this.imageStreamConfiguration.port,
      path: this.imageStreamConfiguration.avatarPath + userId,
      method: 'POST',
      headers: {
        ...req.headers,
      },
    };
    console.log('options in app.file.controller:', options);

    const data = {
      statusCode: 0,
      body: '',
    };
    console.log('data in app.file.controller v1:', data);

    // отправляем запрос на другой микросервис
    const forwardRequest = http.request(options, (forwardResponse) => {
      console.log('Response from second server:', forwardResponse.statusCode);
      // console.log('forwardRequest in app.file.controller:', forwardRequest);

      // переменная для хранения данных ответа
      let responseData = '';
      // собираем данные из ответа
      forwardResponse.on('data', (chunk) => {
        responseData += chunk;
      });
      console.log('responseData in app.file.controller:', responseData);

      // обрабатываем полный ответ
      forwardResponse.on('end', () => {
        try {
          const parsedResponse = JSON.parse(responseData);
          console.log('Parsed response from second server:', parsedResponse);
          data.statusCode = forwardResponse.statusCode as number;
          data.body = parsedResponse;
        } catch (error) {
          console.error('Error parsing response from second server:', error);
          res.status(500).send('Error parsing response from second server');
        }
      });
    });

    //
    req.on('data', (chunk) => {
      console.log(chunk.length, 'bytes received');
      forwardRequest.write(chunk);
    });

    //
    req.on('end', () => {
      forwardRequest.end();
    });

    //
    forwardRequest.on('error', (err) => {
      console.error('Error forwarding request:', err);
      res.status(500).send('Error forwarding request');
      return;
    });

    console.log('data in app.file.controller v2:', data);
    return data;
  }

  // @UseGuards(JwtAuthGuard)
  // @Delete('/avatar')
  // @DeleteAvatarSwagger()
  // async deleteAvatar(@UserIdFromRequest() userInfo: { userId: string }) {
  //   console.log('userInfo.userId in file controller v1 (deleteAvatar):', userInfo.userId);

  //   const result = await this.commandBus.execute(new DeleteAvatarUserCommand({ userId: userInfo.userId }));
  //   console.log('result in file controller v1 (deleteAvatar):', result);

  //   if (!result.isSuccess) throw result.error;

  //   return;
  // }
}
