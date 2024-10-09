import * as fs from 'fs';
import { promises as fsPromises } from 'fs';

import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FileUploadService {
  // Проверяем, существует ли файл
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fsPromises.access(filePath);
      return true;
    } catch {
      return false; // Файл не существует
    }
  }

  // Метод для создания потока файла
  createFileStream(filePath: string): fs.ReadStream {
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException(`Файл не найден: ${filePath}`);
    }

    try {
      return fs.createReadStream(filePath);
    } catch (error) {
      throw new BadRequestException(`Ошибка при создании потока файла: ${error.message}`);
    }
  }

  // Асинхронное удаление файла с повторной попыткой
  async deleteFile(filePath: string, maxRetries: number = 3): Promise<void> {
    try {
      const fileExists = await this.fileExists(filePath);
      if (!fileExists) {
        throw new BadRequestException('Файл не существует, удаление невозможно');
      }

      await this.tryDeleteFile(filePath, maxRetries);
    } catch (error) {
      throw new BadRequestException(`Ошибка при удалении файла: ${error.message}`);
    }
  }

  // Логика для повторной попытки удаления файла
  private async tryDeleteFile(filePath: string, retries: number): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await fsPromises.unlink(filePath);
        return; // Если успешно удалено, выходим из цикла
      } catch (error) {
        if (attempt === retries) {
          throw new BadRequestException(`Не удалось удалить файл после ${retries} попыток: ${error.message}`);
        }
      }
    }
  }
}
