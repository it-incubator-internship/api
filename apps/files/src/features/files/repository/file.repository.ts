import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { FileDocument, FileEntity, FileType } from '../schema/files.schema';
import { FileUploadResultDocument, FileUploadResultEntity } from '../schema/files-upload-result.schema';

@Injectable()
export class FileRepository {
  constructor(
    @InjectModel(FileEntity.name) private fileModel: Model<FileDocument>,
    @InjectModel(FileUploadResultEntity.name) private fileUploadResultModel: Model<FileUploadResultDocument>,
  ) {}

  async create(file: FileEntity): Promise<FileEntity> {
    const result = await this.fileModel.create(file);
    await result.save();
    return result;
  }

  async createFileUploadResult(uploadResult: FileUploadResultEntity): Promise<FileUploadResultEntity> {
    const result = await this.fileUploadResultModel.create(uploadResult);
    await result.save();
    return result;
  }

  async findAvatar({ userId }: { userId: string }): Promise<FileEntity | null> {
    const avatar = await this.fileModel.findOne({ userId, type: FileType.avatar }).exec();

    return avatar;
  }

  async findDeletedAvatars() {
    const avatars = await this.fileModel.find({
      deletedAt: { $ne: null }, // значение не равно null
    });

    return avatars;
  }

  async findUploadResults() {
    const uploadResults = await this.fileUploadResultModel.find();

    return uploadResults;
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

  async deleteUploadResult({ id }: { id: Types.ObjectId }): Promise<void> {
    await this.fileUploadResultModel.deleteOne({ _id: id });

    return;
  }
}
