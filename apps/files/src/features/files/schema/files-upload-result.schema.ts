import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FileUploadResultDocument = HydratedDocument<FileUploadResultEntity>;

@Schema()
export class FileUploadResultEntity {
  @Prop({
    type: Boolean,
    required: true,
  })
  success: boolean;

  @Prop({
    type: String,
    nullable: true,
  })
  smallUrl: string | null;

  @Prop({
    type: String,
    nullable: true,
  })
  originalUrl: string | null;

  @Prop({
    type: String,
    required: true,
  })
  eventId: string;

  static create({
    success,
    smallUrl,
    originalUrl,
    eventId,
  }: {
    success: boolean;
    smallUrl: string | null;
    originalUrl: string | null;
    eventId: string;
  }) {
    const fileUploadResult = new this();

    fileUploadResult.success = success;
    fileUploadResult.smallUrl = smallUrl;
    fileUploadResult.originalUrl = originalUrl;
    fileUploadResult.eventId = eventId;

    return fileUploadResult;
  }
}

export const FileUploadResultSchema = SchemaFactory.createForClass(FileUploadResultEntity);

FileUploadResultSchema.loadClass(FileUploadResultEntity);
