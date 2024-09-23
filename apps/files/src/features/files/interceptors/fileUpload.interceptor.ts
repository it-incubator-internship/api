import * as fs from 'fs';
import * as path from 'path';

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import busboy from 'busboy';
import { Request } from 'express';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();

    return new Observable<{ filePath: string }>((observer) => {
      // Указываем тип возвращаемого объекта
      const bb = busboy({ headers: req.headers });
      let saveFilePath: string;

      bb.on('file', (fieldname, file, info) => {
        const { filename } = info;

        // Генерируем путь для сохранения файла
        saveFilePath = path.join(__dirname, '..', 'uploads', filename);

        // Создаем поток для записи файла
        const writeStream = fs.createWriteStream(saveFilePath);
        file.pipe(writeStream);

        // Обрабатываем ошибки при записи файла
        writeStream.on('error', (err) => {
          console.error('Error writing file:', err);
          observer.error('Error saving file');
        });

        // Когда файл успешно записан
        writeStream.on('finish', () => {
          console.log(`File [${filename}] saved at [${saveFilePath}]`);
        });
      });

      bb.on('finish', () => {
        console.log('Upload finished');
        observer.next({ filePath: saveFilePath }); // Передаем путь к файлу
        observer.complete();
      });

      // Передаем поток запроса в busboy
      req.pipe(bb);
    }).pipe(
      map((data: { filePath: string }) => {
        // Указываем явный тип данных
        // Возвращаем путь к файлу дальше по потоку
        return { filePath: data.filePath };
      }),
    );
  }
}
