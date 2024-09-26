import * as fs from 'fs';
import { promises as fsPromises } from 'fs';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FileNotFoundException, FileOperationException } from '../file-upload.exceptions';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(private configService: ConfigService) {}

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fsPromises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async createFileStream(filePath: string): Promise<fs.ReadStream> {
    if (!(await this.fileExists(filePath))) {
      this.logger.error(`File not found: ${filePath}`);
      throw new FileNotFoundException(filePath);
    }

    try {
      return fs.createReadStream(filePath);
    } catch (error) {
      this.logger.error(`Error creating file stream: ${error.message}`);
      throw new FileOperationException(`Error creating file stream: ${error.message}`);
    }
  }

  async deleteFile(filePath: string, maxRetries: number = 3): Promise<void> {
    const fileExists = await this.fileExists(filePath);
    if (!fileExists) {
      this.logger.warn(`File does not exist, cannot delete: ${filePath}`);
      return;
    }

    await this.tryDeleteFile(filePath, maxRetries);
  }

  private async tryDeleteFile(filePath: string, retries: number): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await fsPromises.unlink(filePath);
        this.logger.log(`File successfully deleted: ${filePath}`);
        return;
      } catch (error) {
        if (attempt === retries) {
          this.logger.error(`Failed to delete file after ${retries} attempts: ${error.message}`);
          throw new FileOperationException(`Failed to delete file after ${retries} attempts: ${error.message}`);
        }
      }
    }
  }
}
