import { Prop, raw, /* raw, */ Schema, SchemaFactory } from '@nestjs/mongoose';
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

@Schema()
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
  // type: Object,
  // required: true,
  //})
  payload: Payload;

  // @Prop({
  //   type: String,
  //   nullable: true,
  // })
  // smallUrl: string | null;

  // @Prop({
  //   type: String,
  //   nullable: true,
  // })
  // originalUrl: string | null;

  @Prop({
    type: String,
    required: true,
  })
  eventId: string;

  static create({
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
    // event.smallUrl = smallUrl;
    // event.originalUrl = originalUrl;
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
