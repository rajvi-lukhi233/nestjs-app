import { PartialType } from '@nestjs/mapped-types';
import { CreateChatRoomDto } from './create-room.dto';

export class UpdateChatRoomDto extends PartialType(CreateChatRoomDto) {}
