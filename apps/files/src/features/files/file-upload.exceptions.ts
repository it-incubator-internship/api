import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

export class FileNotFoundException extends NotFoundException {
  constructor(filePath: string) {
    super(`File not found: ${filePath}`);
  }
}

export class FileOperationException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
  }
}
