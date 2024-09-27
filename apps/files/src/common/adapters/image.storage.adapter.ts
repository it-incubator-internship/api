import { Readable } from 'stream';
import { randomUUID } from 'crypto';

import { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Upload } from '@aws-sdk/lib-storage';

@Injectable()
export class ImageStorageAdapter {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    const REGION = 'ru-central1';
    const cloudSetting = this.configService.get('cloudSettings');

    this.s3Client = new S3Client({
      region: REGION,
      endpoint: cloudSetting.address,
      credentials: {
        secretAccessKey: cloudSetting.secretAccessKey,
        accessKeyId: cloudSetting.accessKeyId,
      },
    });
  }

  async saveImageFromStream(stream: Readable) {
    const imageName = randomUUID();
    const key = `content/images/${imageName}.jpg`;

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: 'navaibe.1.0',
        Key: key,
        Body: stream,
        ContentType: 'image/jpeg',
      },
    });
    console.log('123');
    try {
      const result = await upload.done();
      console.log('Upload result:', result);
      return {
        name: `${imageName}.jpg`,
      };
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }
}
