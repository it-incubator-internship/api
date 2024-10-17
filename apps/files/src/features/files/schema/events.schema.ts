import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum EventType {
  uploadAvatar = 'UploadAvatar',
  uploadPost = 'UploadPost',
}

type Payload = {
  smallUrl: string | null;
  originalUrl: string | null;
};

export type EventDocument = HydratedDocument<EventEntity>;

@Schema({ timestamps: { createdAt: 'createdAt' } })
export class EventEntity {
  @Prop({
    type: Boolean,
    required: true,
  })
  success: boolean;

  @Prop({
    type: String,
    enum: Object.values(EventType),
    required: true,
  })
  type: EventType;

  @Prop(
    raw({
      smallUrl: { type: String, nullable: true },
      originalUrl: { type: String, nullable: true },
    }),
  )
  payload: Payload;

  @Prop({
    type: String,
    required: true,
  })
  eventId: string;

  @Prop({ type: Date })
  createdAt: Date;

  static createAvatarUploadEvent({
    success,
    type,
    smallUrl,
    originalUrl,
    eventId,
  }: {
    success: boolean;
    type: EventType;
    smallUrl: string | null;
    originalUrl: string | null;
    eventId: string;
  }) {
    const event = new this();

    event.success = success;
    event.type = type;
    event.payload = {
      smallUrl,
      originalUrl,
    };
    event.eventId = eventId;

    return event;
  }
}

export const EventSchema = SchemaFactory.createForClass(EventEntity);

EventSchema.loadClass(EventEntity);
