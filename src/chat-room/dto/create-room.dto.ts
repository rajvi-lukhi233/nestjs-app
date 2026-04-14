import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateChatRoomDto {
  @IsString()
  roomId: string;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsArray()
  @IsMongoId({ each: true })
  users: string[];
}
