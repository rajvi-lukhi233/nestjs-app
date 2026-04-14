import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas/group.schema';
import { ChatRoomModule } from 'src/chat-room/chat-room.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    ChatRoomModule,
  ],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
