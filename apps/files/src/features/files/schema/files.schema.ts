import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FileDocument = HydratedDocument<FileEntity>;

export enum FileFormat {
  webm = 'webm',
  webp = 'webp',
}

export enum FileType {
  avatar = 'avatar',
}

type ImageUrl = {
  small?: string;
  medium?: string;
  original?: string;
};

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class FileEntity {
  @Prop({
    type: String,
    required: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: true,
  })
  format: FileFormat;

  @Prop({
    type: String,
    required: true,
  })
  type: FileType;

  @Prop({ type: String, nullable: true, default: null })
  description: string | null;

  @Prop(
    raw({
      small: { type: String, required: false },
      medium: { type: String, required: false },
      original: { type: String, required: false },
    }),
  )
  url: ImageUrl;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  static create({
    // userId,
    format,
    type,
    url,
    description,
  }: {
    // userId: string;
    format: FileFormat;
    type: FileType;
    url: ImageUrl;
    description?: string;
  }) {
    const file = new this();

    // file.userId = userId;
    file.format = format;
    file.type = type;
    file.url = url;
    file.description = description ? description : null;

    return file;
  }

  delete() {
    this.deletedAt = new Date();
  }
}

export const FileSchema = SchemaFactory.createForClass(FileEntity);

FileSchema.loadClass(FileEntity);
