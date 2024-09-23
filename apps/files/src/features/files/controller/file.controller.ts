import * as fs from 'fs';
import * as path from 'path';

import { Controller, Param, ParseUUIDPipe, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import busboy from 'busboy';

@Controller('file')
export class FileController {
  constructor() {}

  @Post('avatar/:userId')
  async handleUpload(@Param('userId', ParseUUIDPipe) userId: string, @Req() req: Request, @Res() res: Response) {
    const bb = busboy({ headers: req.headers });

    let saveFilePath: string;

    bb.on('file', (name, file, info) => {
      console.log('name', name);
      console.log('file', file);
      console.log('info', JSON.stringify(info));
      saveFilePath = path.join(__dirname, '..', info.filename);
      file.pipe(fs.createWriteStream(saveFilePath));
    });

    bb.on('finish', () => {
      console.log('Upload completed');
      res.writeHead(200, { Connection: 'close' });
      res.end('File uploaded successfully');
    });

    req.pipe(bb);
  }
}
