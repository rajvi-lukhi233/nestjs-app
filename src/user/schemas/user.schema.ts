import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../user.type';

export type userDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: Role, default: Role.User })
  role: string;

  @Prop({ default: null })
  resetPassToken: string;

  @Prop({ default: null })
  resetPassTokenExpired: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
