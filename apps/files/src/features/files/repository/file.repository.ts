import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { FileDocument, FileEntity } from '../schema/files.schema';

@Injectable()
export class FileRepository {
  constructor(@InjectModel(FileEntity.name) private fileModel: Model<FileDocument>) {}

  async create(file: FileEntity): Promise<FileEntity> {
    const result = await this.fileModel.create(file);
    await result.save();
    return result;
  }

  async findAvatar({ userId }: { userId: string }): Promise<FileEntity | null> {
    const avatar = await this.fileModel.findOne({ userId /* , type: FileType.avatar */ }).exec();
    console.log('avatar in file repository:', avatar);

    return avatar;
  }

  async updateAvatar(avatar: FileEntity) /*:*/ {
    const result = await this.fileModel.updateOne(
      { userId: avatar.userId, type: avatar.type },
      { $set: { deletedAt: avatar.deletedAt } },
    );
    console.log('result in file repository:', result);

    return result.modifiedCount === 1;
  }
}
