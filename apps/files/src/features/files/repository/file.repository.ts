import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { FileDocument, FileEntity, FileType } from '../schema/files.schema';

@Injectable()
export class FileRepository {
  constructor(@InjectModel(FileEntity.name) private fileModel: Model<FileDocument>) {}

  async create(file: FileEntity): Promise<FileEntity> {
    const result = await this.fileModel.create(file);
    await result.save();
    return result;
  }

  async findAvatar({ userId }: { userId: string }): Promise<FileEntity[] | []> {
    const avatars = await this.fileModel.find({ userId, type: FileType.avatar }).exec();

    return avatars;
  }

  async findDeletedAvatars() {
    const avatars = await this.fileModel.find({
      deletedAt: { $ne: null }, // значение не равно null
    });

    return avatars;
  }

  async updateAvatar(avatar: FileEntity): Promise<void> {
    await this.fileModel.updateOne(
      { userId: avatar.userId, type: avatar.type },
      { $set: { deletedAt: avatar.deletedAt } },
    );

    return;
  }

  async deleteAvatar({ id }: { id: Types.ObjectId }): Promise<void> {
    await this.fileModel.deleteOne({ _id: id });

    return;
  }
}
