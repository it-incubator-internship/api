import * as fs from 'fs/promises';

import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';

import { ImgProcessingAdapter } from './img-processing-adapter.interface';

@Injectable()
export class SharpImgProcessingAdapter implements ImgProcessingAdapter {
  async convertToWebp(filePath: string, maxSizeInBytes: number, quality: number = 70): Promise<string> {
    // Получаем информацию о файле
    const fileStats = await fs.stat(filePath);

    // Проверяем размер файла
    //TODO сделать object result
    if (fileStats.size > maxSizeInBytes) {
      throw new BadRequestException(`Размер файла превышает допустимый лимит в ${maxSizeInBytes / (1024 * 1024)} MB.`);
    }

    // Создаем новый путь для файла в формате .webp
    const webpFilePath = filePath.replace(/\.[^/.]+$/, '') + '.original.webp';

    // Преобразование изображения в формат webp с помощью sharp
    await sharp(filePath)
      .toFormat('webp') // Конвертируем в формат webp
      .webp({ quality }) // Устанавливаем качество изображения
      .toFile(webpFilePath); // Сохраняем преобразованное изображение

    return webpFilePath;
  }

  async resizeAvatar(filePath: string): Promise<string> {
    // Создаем новый путь для файла в формате .webp
    const webpFilePath = filePath.replace(/\.[^/.]+$/, '') + '.small.webp';

    // Изменение размера изображения в формат webp с помощью sharp
    await sharp(filePath)
      .resize(150, 150) // Устанавливаем размер изображения
      .toFile(webpFilePath); // Сохраняем преобразованное изображение

    return webpFilePath;
  }
}
