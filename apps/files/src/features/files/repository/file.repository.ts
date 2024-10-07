import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';

import { FileDocument, FileEntity, FileType } from '../schema/files.schema';

@Injectable()
export class FileRepository {
  constructor(@InjectModel(FileEntity.name) private fileModel: Model<FileDocument>) {}

  async create(file: FileEntity): Promise<FileEntity> {
    const result = await this.fileModel.create(file);
    await result.save();
    return result;
  }

  async findAvatar({ userId }: { userId: string }): Promise<FileEntity | null> {
    console.log('console.log in file repository (findAvatar)');
    console.log('userId in file repository:', userId);

    const avatar = await this.fileModel.findOne({ userId, type: FileType.avatar }).exec();
    console.log('avatar in file repository:', avatar);

    return avatar;
  }

  async findDeletedAvatars() /* : Promise<FileEntity[] | []> */ {
    console.log('console.log in file repository (findDeletedAvatars)');

    const avatars = await this.fileModel.find({
      deletedAt: { $ne: null }, // значение не равно null
      type: 'avatar', // тип равен "avatar"
    });
    console.log('avatars in file repository (findDeletedAvatars):', avatars);

    return avatars;
  }

  async updateAvatar(avatar: FileEntity): Promise<boolean> {
    const result = await this.fileModel.updateOne(
      { userId: avatar.userId, type: avatar.type },
      { $set: { deletedAt: avatar.deletedAt } },
    );
    console.log('result in file repository:', result);

    return result.modifiedCount === 1;
  }

  async deleteAvatar({ id }: { id: any }) /* : Promise<boolean> */ {
    console.log('console.log in file repository (deleteAvatar)');
    console.log('_id in file repository (findDeletedAvatars):', id);

    const result = await this.fileModel.deleteOne({ _id: id });
    console.log('result in file repository (deleteAvatar):', result);

    return result.deletedCount === 1;
  }
}
