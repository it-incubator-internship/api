// import { randomUUID } from 'crypto';

import { /* PutObjectCommand, PutObjectCommandOutput, */ S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ConfigurationType } from '../settings/configuration';

@Injectable()
export class ImageStorageAdapter {
  s3Client: S3Client;
  constructor(private readonly configService: ConfigService<ConfigurationType, true>) {
    const REGION = 'us-east-1';

    const cloudSetting = configService.get('cloudSettings', {
      infer: true,
    });

    this.s3Client = new S3Client({
      region: REGION,
      endpoint: cloudSetting.address,
      credentials: {
        secretAccessKey: cloudSetting.secretAccessKey,
        accessKeyId: cloudSetting.accessKeyId,
      },
    });
  }

  // async saveImage(buffer: Buffer) {
  //   console.log('buffer in image storage adapter:', buffer);

  //   const imageName = randomUUID();
  //   console.log('imageName in image storage adapter:', imageName);

  //   const key = `content/images/${imageName}.jpg`;
  //   console.log('key in image storage adapter:', key);

  //   const bucketParams = {
  //     Bucket: 'alex777',
  //     Key: key,
  //     Body: buffer,
  //     ContentType: 'image/jpg',
  //   };

  //   const command = new PutObjectCommand(bucketParams);
  //   console.log('command in image storage adapter:', command);

  //   try {
  //     const uploadResult: PutObjectCommandOutput = await this.s3Client.send(command);
  //     console.log('uploadResult in image storage adapter:', uploadResult);

  //     return {
  //       ame: `${imageName}.jpg`,
  //       // field: uploadResult.ETag
  //     };
  //   } catch (exception) {
  //     console.log('exception in image storage adapter:', exception);

  //     throw exception;
  //   }
  // }
}
