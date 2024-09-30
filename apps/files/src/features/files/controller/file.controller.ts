// import * as fs from 'fs';
// import * as path from 'path';

// import { Controller, /* Delete, */ Param, ParseUUIDPipe, Post, Req, Res } from '@nestjs/common';
// import { Request, Response } from 'express';
// import busboy from 'busboy';
// import { CommandBus } from '@nestjs/cqrs';

// // import { DeleteAvatarUserCommand } from '../application/command/delete.avatar.user.command';

// @Controller('file')
// export class FileController {
//   constructor(private commandBus: CommandBus) {}

//   @Post('avatar/:id')
//   async handleUpload(@Param('id', ParseUUIDPipe) userId: string, @Req() req: Request, @Res() res: Response) {
//     console.log('userId in file controller:', userId);

//     const bb = busboy({ headers: req.headers });

//     let saveFilePath: string;

//     bb.on('file', (name, file, info) => {
//       console.log('name', name);
//       console.log('file', file);
//       console.log('info', JSON.stringify(info));
//       saveFilePath = path.join(__dirname, '..', info.filename);
//       file.pipe(fs.createWriteStream(saveFilePath));
//     });

//     bb.on('finish', () => {
//       console.log('Upload completed');
//       res.writeHead(200, { Connection: 'close' });
//       res.end('File uploaded successfully');
//     });

//     req.pipe(bb);
//   }

//   // @Delete('avatar/:url')
//   // async handleDelete(@Param('id', ParseUUIDPipe) userId: string /* , @Req() req: Request, @Res() res: Response */) {
//   //   console.log('userId in file controller v2(handleDelete):', userId);

//   //   // const result = await this.commandBus.execute(new DeleteAvatarUserCommand({ userId }));
//   //   // console.log('result in file controller v2 (deleteAvatar):', result);

//   //   // return /* blog */;
//   // }
// }
