import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { ChatType, MessageType } from '../schemas/message.schema';

export class CreateMessageDto {
  @IsMongoId()
  roomId: string;

  @IsString()
  message: string;

  @IsString()
  messageType: string;

  @IsOptional()
  @IsMongoId()
  groupId?: string;

  @IsMongoId()
  senderId: string;

  @IsMongoId()
  receiverId: string;

  @IsString()
  chatType: string;
}
