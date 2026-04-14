import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type ChatRoomDocument = HydratedDocument<ChatRoom>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class ChatRoom {
  @Prop({ required: true })
  roomId: string;

  @Prop({ default: null })
  groupId: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], default: [] })
  users: Types.ObjectId[];
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
