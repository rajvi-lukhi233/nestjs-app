import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { ChatRoom } from '../../chat-room/schemas/chat-room.schema';

export type MessageDocument = HydratedDocument<Message>;

export enum MessageType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
}

export enum ChatType {
  Personal = 'personal',
  Group = 'group',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Message {
  @Prop({ type: Types.ObjectId, ref: ChatRoom.name, required: true })
  roomId: Types.ObjectId;

  @Prop({ default: null })
  message: string;

  @Prop({ enum: MessageType, default: MessageType.Text })
  messageType: string;

  @Prop({ type: Types.ObjectId, default: null })
  groupId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, default: null })
  receiverId: Types.ObjectId;

  @Prop({ enum: ChatType, default: ChatType.Personal })
  chatType: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
