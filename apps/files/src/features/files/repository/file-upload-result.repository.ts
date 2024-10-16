import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model /* , Types */ } from 'mongoose';

// import { FileDocument, FileEntity, FileType } from '../schema/files.schema';
// import { FileUploadResultDocument, FileUploadResultEntity } from '../schema/files-upload-result.schema';
import { UploadResultType } from '../application/command/send.upload.result.command';
import { EventsDocument, EventsEntity } from '../schema/files-upload-result.schema';

@Injectable()
export class FileUploadRepository {
  constructor(
    // @InjectModel(FileEntity.name) private fileModel: Model<FileDocument>,
    @InjectModel(EventsEntity.name) private fileUploadResultModel: Model<EventsDocument>,
  ) {}

  // async create(file: FileEntity): Promise<FileEntity> {
  //   const result = await this.fileModel.create(file);
  //   await result.save();
  //   return result;
  // }

  async createFileUploadResult(uploadResult: EventsEntity): Promise<EventsEntity> {
    const result = await this.fileUploadResultModel.create(uploadResult);
    await result.save();
    return result;
  }

  // async findAvatar({ userId }: { userId: string }): /* Promise<FileEntity | null> */ Promise<FileEntity[] | []> {
  //   // const avatar = await this.fileModel.findOne({ userId, type: FileType.avatar }).exec();
  //   const avatars = await this.fileModel.find({ userId, type: FileType.avatar }).exec();
  //   console.log('avatars in file repository (findAvatar):', avatars);

  //   return avatars;
  // }

  // async findDeletedAvatars() {
  //   const avatars = await this.fileModel.find({
  //     deletedAt: { $ne: null }, // значение не равно null
  //   });

  //   return avatars;
  // }

  async findUploadResults(): Promise<UploadResultType[] | []> {
    const uploadResults = await this.fileUploadResultModel.find();

    const transformedResults = uploadResults.map((u) => ({
      ...u, // Копируем все остальные поля объекта
      id: u._id.toString(), // Преобразуем _id в строку
    }));
    console.log('transformedResults in file repositiry:', transformedResults);

    // return uploadResults;
    return transformedResults;
  }

  // async updateAvatar(avatar: FileEntity): Promise<void> {
  //   await this.fileModel.updateOne(
  //     { userId: avatar.userId, type: avatar.type },
  //     { $set: { deletedAt: avatar.deletedAt } },
  //   );

  //   return;
  // }

  // async deleteAvatar({ id }: { id: Types.ObjectId }): Promise<void> {
  //   await this.fileModel.deleteOne({ _id: id });

  //   return;
  // }

  async deleteUploadResult({ id }: { id: /* Types.ObjectId */ string }): Promise<void> {
    try {
      await this.fileUploadResultModel.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    } catch {
      console.error('error in file repository (deleteUploadResult)');
    }
    // await this.fileUploadResultModel.deleteOne({ _id });

    return;
  }
}
