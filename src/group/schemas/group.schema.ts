import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type GroupDocument = HydratedDocument<Group>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Group {
  @Prop({ default: null })
  groupName: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], default: [] })
  users: Types.ObjectId[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);
