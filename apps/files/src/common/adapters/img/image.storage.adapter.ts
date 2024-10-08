import { Readable } from 'stream';
import { randomUUID } from 'crypto';

import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Upload } from '@aws-sdk/lib-storage';

@Injectable()
export class ImageStorageAdapter {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    const REGION = 'ru-central1';
    const cloudSetting = this.configService.get('cloudSettings');
    console.log('cloudSetting in image storage adapter:', cloudSetting);

    this.s3Client = new S3Client({
      region: REGION,
      endpoint: cloudSetting.address,
      credentials: {
        secretAccessKey: cloudSetting.secretAccessKey,
        accessKeyId: cloudSetting.accessKeyId,
      },
    });
    console.log('this.s3Client in image storage adapter:', this.s3Client);
  }

  async saveImageFromStream(stream: Readable) {
    const imageName = randomUUID();
    const key = `content/images/${imageName}.webp`;

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: 'navaibe.1.0',
        Key: key,
        Body: stream,
        ContentType: 'image/webp',
      },
    });
    try {
      const result = await upload.done();
      return {
        url: result.Location,
      };
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }

  async deleteAvatar({ url }: { url: string }) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: 'navaibe.1.0',
      Key: url,
    });
    console.log('deleteCommand in image storage adapter:', deleteCommand);
    try {
      const result = await this.s3Client.send(deleteCommand);
      console.log('result in image storage adapter:', result);
      console.log(`Object ${url} deleted successfully.`, result);
    } catch (error) {
      console.error('Error deleting object:', error);
    }
  }
}
