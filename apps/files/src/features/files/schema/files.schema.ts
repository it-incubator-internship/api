import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FileDocument = HydratedDocument<Files>;

export enum FileFormat {
  jpeg = 'jpeg',
  png = 'png',
  webm = 'webm',
}

export enum FileType {
  wallpaper = 'wallpaper',
  main = 'main',
}

type ImageUrl = {
  small?: string;
  medium?: string;
  original: string;
};

@Schema()
export class Files {
  @Prop({
    required: true,
  })
  format: FileFormat;

  @Prop({
    required: true,
  })
  type: FileType;

  @Prop()
  description: string;

  @Prop(
    raw({
      small: { type: String, required: false },
      medium: { type: String, required: false },
      original: { type: String, required: true },
    }),
  )
  url: ImageUrl;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;

  static create(format: FileFormat, type: FileType, url: ImageUrl) {
    const file = new this();

    file.format = format;
    file.type = type;
    file.url = url;
    file.createdAt = new Date();
    file.updatedAt = new Date();

    return file;
  }

  updateDescription(description: string) {
    this.description = description;
  }

  delete() {
    this.deletedAt = new Date();
  }
}

export const FileSchema = SchemaFactory.createForClass(Files);

FileSchema.methods = {
  update: Files.prototype.updateDescription,
  delete: Files.prototype.delete,
};
