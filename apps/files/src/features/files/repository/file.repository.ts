import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { FileDocument, FileEntity } from '../schema/files.schema';

@Injectable()
export class FileRepository {
  constructor(@InjectModel(FileEntity.name) private fileModel: Model<FileDocument>) {}

  async create(file: FileEntity): Promise<FileEntity> {
    return await this.fileModel.create(file);
  }

  //   async findAvatar({ userId }: { userId: string }) /*:*/ {
  //     const avatar = await this.fileModel.findOne({ userId }).exec();
  //     console.log('avatar in file repository:', avatar);

  //     return avatar;
  //   }
}
