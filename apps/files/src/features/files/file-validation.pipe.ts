import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const maxSize = this.configService.get('MAX_FILE_SIZE');
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds the limit of ${maxSize} bytes`);
    }

    const allowedTypes = this.configService.get('ALLOWED_FILE_TYPES');
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    return file;
  }
}
