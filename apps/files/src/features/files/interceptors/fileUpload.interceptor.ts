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

          // // // Отправляем ответ клиенту сразу после сохранения файла
          // res.status(204).send();

          // Вызываем следующий обработчик и подписываемся на его результаты
          // next.handle().subscribe({
          //   next: (data) => {
          //     observer.next(data); // Передаем результаты обратно в поток
          //   },
          //   error: (err) => {
          //     console.error('Error in controller:', err);
          //     observer.error(err); // Обработка ошибок
          //   },
          //   complete: () => {
          //     observer.complete(); // Завершение потока
          //   },
          // });

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

// import * as fs from 'fs';
// import * as path from 'path';

// import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import busboy from 'busboy';
// import { Request } from 'express';

// @Injectable()
// export class FileUploadInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     const req = context.switchToHttp().getRequest<Request>();

//     return new Observable<{ filePath: string }>((observer) => {
//       // Указываем тип возвращаемого объекта
//       const bb = busboy({ headers: req.headers });
//       let saveFilePath: string;

//       bb.on('file', (fieldname, file, info) => {
//         const { filename } = info;

//         // Генерируем путь для сохранения файла
//         const uploadDir = path.join(__dirname, '..', 'uploads');
//         saveFilePath = path.join(uploadDir, filename);

//         if (!fs.existsSync(uploadDir)) {
//           fs.mkdirSync(uploadDir, { recursive: true });
//         }

//         // Создаем поток для записи файла
//         const writeStream = fs.createWriteStream(saveFilePath);

//         file.pipe(writeStream);

//         // Обрабатываем ошибки при записи файла
//         writeStream.on('error', (err) => {
//           console.error('Error writing file:', err);
//           observer.error('Error saving file');
//         });

//         // Когда файл успешно записан
//         writeStream.on('finish', () => {
//           console.log(`File [${filename}] saved at [${saveFilePath}]`);
//         });
//       });

//       bb.on('finish', () => {
//         console.log('Upload finished');
//         // Добавляем filePath к объекту request
//         req['filePath'] = saveFilePath;
//         // Передаем управление дальше
//         next.handle().subscribe(observer);
//       });

//       // Передаем поток запроса в busboy
//       req.pipe(bb);
//     });
//   }
// }
