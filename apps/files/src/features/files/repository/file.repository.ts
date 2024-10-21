import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { FileDocument, FileEntity, FileType } from '../schema/files.schema';

@Injectable()
export class FileRepository {
  constructor(@InjectModel(FileEntity.name) private fileModel: Model<FileDocument>) {}

  async create(file: FileEntity): Promise<FileEntity> {
    const result = await this.fileModel.create(file);
    await result.save();
    return result;
  }

  async findAvatar({ userId }: { userId: string }): Promise<FileEntity[]> {
    const avatars = await this.fileModel.find({ userId, type: FileType.avatar }).exec();

    return avatars;
  }

  async findDeletedAvatars() {
    const avatars = await this.fileModel.find({
      deletedAt: { $ne: null }, // значение не равно null
    });

    const transformedResults = avatars.map((a) => ({
      id: a._id.toString(), // Преобразуем _id в строку
      url: {
        small: a.url.small,
        original: a.url.original,
      },
      description: a.description,
      userId: a.userId,
      format: a.format,
      type: a.type,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      deletedAt: a.deletedAt,
    }));

    return transformedResults;
  }

  async updateAvatar(avatar: FileEntity): Promise<void> {
    await this.fileModel.updateOne(
      { userId: avatar.userId, type: avatar.type },
      { $set: { deletedAt: avatar.deletedAt } },
    );

    return;
  }

  async deleteAvatar({ id }: { id: string }): Promise<void> {
    try {
      await this.fileModel.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    } catch {
      console.error('error in file repository (deleteAvatar)');
    }

    return;
  }
}
