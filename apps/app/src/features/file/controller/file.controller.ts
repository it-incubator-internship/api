import * as http from 'http';

import { /* Express, */ Request, Response } from 'express';
// import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  // Param,
  // ParseFilePipeBuilder,
  // ParseUUIDPipe,
  Post,
  Req,
  Res,
  // UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// import sharp from 'sharp';

// import { BadRequestError } from '../../../../../common/utils/result/custom-error';
import { JwtAuthGuard } from '../../user/auth/guards/jwt.auth.guard';
import { UserIdFromRequest } from '../../user/auth/decorators/controller/userIdFromRequest';

// @ApiTags('file')
@Controller('file')
export class FileController {
  constructor() {} // private userRepository: UserQueryRepository, // private commandBus: CommandBus,

  // @UseGuards(JwtAuthGuard)
  // @Post(':id/avatar') // id берём из payload
  // @UseInterceptors(FileInterceptor('file'))
  // // @UpdateUserProfileSwagger()
  // async uploadAvatar(
  //   @UploadedFile(
  //     new ParseFilePipeBuilder()
  //       .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
  //       .addMaxSizeValidator({ maxSize: /* 10485760 */ 100000 })
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
  @Post('avatar') // id из payload
  @UseInterceptors(FileInterceptor('file'))

  // @UpdateUserProfileSwagger()
  async uploadAvatar(
    @Req() req: Request,
    @Res() res: Response,
    @UserIdFromRequest() userInfo: { userId: string },
    // @UploadedFile(
    //   new ParseFilePipeBuilder()
    //     .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
    //     .addMaxSizeValidator({ maxSize: /* 10485760 */ 100000 })
    //     .build({
    //       exceptionFactory: () => {
    //         throw new BadRequestError('The photo size is more than 10 MB or the format is not JPEG or PNG', [
    //           {
    //             message: 'The photo must be less than 10 Mb and have JPEG or PNG format',
    //             field: '',
    //           },
    //         ]);
    //       },
    //     }),
    // )
    // file: Express.Multer.File,
  ) {
    console.log('console.log in file controller');
    console.log('userInfo in file controller:', userInfo);

    let isValid = false;
    let headerChecked = false;

    const options = {
      hostname: 'другой-микросервис',
      port: 3000,
      path: '/upload',
      method: 'POST',
      headers: {
        ...req.headers,
        'Transfer-Encoding': 'chunked',
      },
    };
    console.log('options in file controller:', options);

    // const forwardRequest = http.request(options, (forwardResponse) => {
    //   res.writeHead(forwardResponse.statusCode ?? 500, forwardResponse.headers);
    //   forwardResponse.pipe(res);
    // });
    // console.log('forwardRequest in file controller:', forwardRequest);

    req.on('data', (chunk) => {
      console.log('console.log 1.0');
      if (!headerChecked) {
        console.log('!headerChecked');
        isValid = this.validateImageHeader(chunk);
        console.log('isValid in file controller:', isValid);
        headerChecked = true;
      }

      if (isValid) {
        // forwardRequest.write(chunk);
        console.log('isValid');
      } else {
        // req.unpipe();
        // forwardRequest.end();
        // res.status(400).send('Invalid image format. Only JPEG, JPG, and PNG are allowed.');
        console.log('!isValid');
      }
    });

    // req.on('end', () => {
    //   if (isValid) {
    //     forwardRequest.end();
    //   }
    // });
  }

  private validateImageHeader(chunk: Buffer): boolean {
    // Проверка JPEG/JPG
    if (chunk[0] === 0xff && chunk[1] === 0xd8 && chunk[2] === 0xff) {
      return true;
    }

    // Проверка PNG
    if (
      chunk[0] === 0x89 &&
      chunk[1] === 0x50 &&
      chunk[2] === 0x4e &&
      chunk[3] === 0x47 &&
      chunk[4] === 0x0d &&
      chunk[5] === 0x0a &&
      chunk[6] === 0x1a &&
      chunk[7] === 0x0a
    ) {
      return true;
    }

    return false;
  }
}
