import * as http from 'http';

import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../user/auth/guards/jwt.auth.guard';
import { UserIdFromRequest } from '../../user/auth/decorators/controller/userIdFromRequest';
import { UploadAvatarSwagger } from '../decorators/swagger/upload-avatar/upload-avatar.swagger.decorator';

@ApiTags('file')
@Controller('file')
export class FileController {
  constructor() {}

  // @UseGuards(JwtAuthGuard)
  // @Post(':id/avatar')
  // @UseInterceptors(FileInterceptor('file'))
  // // @UpdateUserProfileSwagger()
  // async uploadAvatar(
  //   @UploadedFile(
  //     new ParseFilePipeBuilder()
  //       .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
  //       .addMaxSizeValidator({ maxSize: 10485760 })
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
  async uploadAvatar(@UserIdFromRequest() userInfo: { userId: string }, @Req() req: Request, @Res() res: Response) {
    console.log('console.log in file controller');
    console.log('req.headers', req.headers);
    console.log('userInfo in file controller:', userInfo);

    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '' /* 'file' */ /* `file/${userInfo.userId}` */,
      method: 'POST',
      headers: {
        ...req.headers,
      },
    };
    console.log('options in file controller:', options);

    const forwardRequest = http.request(options, (forwardResponse) => {
      console.log('Response from second server:', forwardResponse.statusCode);
      forwardResponse.pipe(res);
    });

    req.on('data', (chunk) => {
      console.log(chunk.length, 'bytes received');
      forwardRequest.write(chunk);
    });

    req.on('end', () => {
      forwardRequest.end();
    });

    forwardRequest.on('error', (err) => {
      console.error('Error forwarding request:', err);
      res.status(500).send('Error forwarding request');
    });
  }
}
