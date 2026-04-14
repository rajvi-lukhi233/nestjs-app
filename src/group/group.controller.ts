import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { RequestUser } from 'src/order/order.service';
import { ChatRoomService } from 'src/chat-room/chat-room.service';
import { CreateChatRoomDto } from 'src/chat-room/dto/create-room.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Types } from 'mongoose';

@Controller('group')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly chatRoomService: ChatRoomService,
  ) {}
  @Post()
  async createNewGroup(
    @Body() dto: CreateGroupDto,
    @Req() req: Request & { user: RequestUser },
  ) {
    const allUsers = [...dto.users, req.user.userId];
    const existUser = await this.groupService.findOneGroup({ name: dto.name });
    if (existUser) {
      throw new BadRequestException('This group is already exist');
    }
    const payload: CreateGroupDto = {
      ...dto,
      users: allUsers,
    };

    const group = await this.groupService.createGroup(payload);
    if (!group) {
      throw new BadRequestException('Group not created');
    }
    const roomPayload: CreateChatRoomDto = {
      roomId: group._id.toString(),
      groupId: group._id.toString(),
      users: allUsers,
    };
    await this.chatRoomService.createRoom(roomPayload);
  }

  @Patch(':groupId')
  async addOrRemoveMember(
    @Body() dto: UpdateGroupDto,
    @Param('groupId') groupId: string,
  ) {
    const group = await this.groupService.findOneGroup({ _id: groupId });
    if (!group) {
      throw new NotFoundException('This group is not found');
    }
    const userIds = dto.users.map((id) => new Types.ObjectId(id));
    if (dto.isRemove) {
      await this.groupService.updateGroup(groupId, {
        $pull: { users: { $in: userIds } },
      });

      await this.chatRoomService.updateRoom(
        { roomId: groupId },
        { $pull: { users: { $in: userIds } } },
      );
    } else {
      await this.groupService.updateGroup(groupId, {
        $addToSet: { users: { $each: userIds } },
      });

      await this.chatRoomService.updateRoom(
        { roomId: groupId },
        { $addToSet: { users: { $each: userIds } } },
      );
    }
  }
}
