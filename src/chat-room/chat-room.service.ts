import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types, UpdateQuery } from 'mongoose';
import { Group } from '../group/schemas/group.schema';
import { Injectable } from '@nestjs/common';
import { ChatRoom } from './schemas/chat-room.schema';
import { CreateChatRoomDto } from './dto/create-room.dto';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectModel(ChatRoom.name) private readonly roomModel: Model<ChatRoom>,
  ) {}

  async createRoom(dto: CreateChatRoomDto) {
    return this.roomModel.create(dto);
  }

  async findOneRoom(filter: QueryFilter<ChatRoom>) {
    return this.roomModel.findOne(filter);
  }

  async findAllRoom(filter: QueryFilter<ChatRoom>) {
    return this.roomModel.find(filter);
  }

  async updateRoom(
    filter: QueryFilter<ChatRoom>,
    update: UpdateQuery<ChatRoom>,
  ) {
    return this.roomModel.findOneAndUpdate(filter, update);
  }
}
