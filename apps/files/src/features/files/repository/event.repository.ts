import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model /* , Types */ } from 'mongoose';

// import { FileDocument, FileEntity, FileType } from '../schema/files.schema';
// import { FileUploadResultDocument, FileUploadResultEntity } from '../schema/files-upload-result.schema';
import { EventsType } from '../application/command/send.event.command';
import { EventDocument, EventEntity } from '../schema/files-upload-result.schema';

@Injectable()
export class EventRepository {
  constructor(
    // @InjectModel(FileEntity.name) private fileModel: Model<FileDocument>,
    @InjectModel(EventEntity.name) private eventModel: Model<EventDocument>,
  ) {}

  // async create(file: FileEntity): Promise<FileEntity> {
  //   const result = await this.fileModel.create(file);
  //   await result.save();
  //   return result;
  // }

  /* async create(eventEntity: EventEntity): Promise<EventEntity> {
    console.log('console.log in event.repository (create)');
    console.log('eventEntity in event.repository (create):', eventEntity);
    const result = await this.eventModel.create(eventEntity);
    console.log('result in event.repository (create):', result);
    const xxx = await result.save();
    console.log('xxx in event.repository (create):', xxx);
    return result;
  } */

  async create(eventEntity: EventEntity): Promise<EventEntity> {
    console.log('console.log in event.repository (create)');
    console.log('eventEntity in event.repository (create):', eventEntity);
    const eventDocument = new this.eventModel(eventEntity);
    console.log('eventDocument in event.repository (create):', eventDocument);
    const xxx = await eventDocument.save();
    console.log('xxx in event.repository (create):', xxx);
    return xxx;
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

  async findEvents(): Promise<EventsType[] | []> {
    const events = await this.eventModel.find();
    console.log('events in file repositiry (findEvents):', events);

    const transformedResults = events.map((u) => ({
      // ...u, // Копируем все остальные поля объекта
      id: u._id.toString(), // Преобразуем _id в строку
      success: u.success,
      type: u.type,
      eventId: u.eventId,
      payload: {
        smallUrl: u.payload.smallUrl,
        originalUrl: u.payload.originalUrl,
      },
    }));
    console.log('transformedResults in file repositiry (findEvents):', transformedResults);

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

  async deleteEvent({ id }: { id: /* Types.ObjectId */ string }): Promise<void> {
    try {
      await this.eventModel.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    } catch {
      console.error('error in file repository (deleteUploadResult)');
    }
    // await this.fileUploadResultModel.deleteOne({ _id });

    return;
  }
}
