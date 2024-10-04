import * as fs from 'fs';
import * as path from 'path';

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import busboy from 'busboy';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('console.log in file.upload.interceptor');

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    return new Observable((observer) => {
      const bb = busboy({ headers: req.headers });
      let saveFilePath: string;

      bb.on('file', (fieldname, file, info) => {
        const { filename } = info;
        const uploadDir = path.join(__dirname, '..', 'uploads');
        saveFilePath = path.join(uploadDir, filename);

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const writeStream = fs.createWriteStream(saveFilePath);
        file.pipe(writeStream);

        writeStream.on('finish', () => {
          console.log(`File [${filename}] saved at [${saveFilePath}]`);
          req['filePath'] = saveFilePath;

          // Вызываем контроллер
          next.handle().subscribe({
            next: (data) => observer.next(data),
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
          });
        });

        writeStream.on('error', (err) => {
          console.error('Error writing file:', err);
          observer.error(err);
        });
      });

      bb.on('error', (err) => {
        console.error('Busboy error:', err);
        observer.error(err);
      });

      req.pipe(bb);
    });
  }
}
