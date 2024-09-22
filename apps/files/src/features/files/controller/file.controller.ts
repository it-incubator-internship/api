import * as fs from 'fs';
import * as path from 'path';

import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import busboy from 'busboy';

@Controller(/* 'file' */)
export class FileController {
  constructor() {}

  @Post(/* ':userId' */)
  async handleUpload(@Req() req: Request, @Res() res: Response) {
    console.log('console.log in file controller');
    console.log('req.headers in file controller:', req.headers);

    const bb = busboy({ headers: req.headers });
    console.log('bb in file controller:', bb);

    let saveFilePath: string;

    bb.on('file', (name, file, info) => {
      console.log('name', name);
      console.log('file', file);
      console.log('info', JSON.stringify(info));
      saveFilePath = path.join(__dirname, '..', info.filename);
      console.log('saveFilePath in file controller:', saveFilePath);
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
