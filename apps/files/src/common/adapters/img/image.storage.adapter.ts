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

    try {
      await this.s3Client.send(deleteCommand);
    } catch (error) {
      console.error('Error deleting object:', error);
    }
  }
}
