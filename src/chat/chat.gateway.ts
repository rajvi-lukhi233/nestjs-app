import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatType } from './schemas/message.schema';
import { ChatRoomService } from 'src/chat-room/chat-room.service';
import { CreateChatRoomDto } from 'src/chat-room/dto/create-room.dto';
import { GroupService } from 'src/group/group.service';
import { Types } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatRoomService: ChatRoomService,
    private readonly groupService: GroupService,
  ) {}
  @WebSocketServer()
  server: Server;

  private readonly userSocketMap = new Map<string, Set<string>>();

  async handleConnection(client: Socket) {
    const userId = this.getUserIdFromClient(client);
    if (!userId) {
      client.emit('error', { message: 'userId is required to connect' });
      client.disconnect();
      return;
    }

    const existing = this.userSocketMap.get(userId) ?? new Set<string>();
    existing.add(client.id);
    this.userSocketMap.set(userId, existing);

    console.log(`User connected: ${userId} (${client.id})`);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketIds] of this.userSocketMap.entries()) {
      if (socketIds.has(client.id)) {
        socketIds.delete(client.id);
        if (socketIds.size === 0) {
          this.userSocketMap.delete(userId);
        }
        console.log(`User disconnected: ${userId} (${client.id})`);
        break;
      }
    }
  }

  @SubscribeMessage('roomJoin')
  async roomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId: string; receiverId: string; chatType: string },
  ) {
    console.log('1');
    const userId = this.getUserIdFromClient(client);
    if (!userId) {
      return this.emitError(client, 'User not authenticated');
    }
    let newRoomId = payload.roomId;
    if (!payload.receiverId || !payload.chatType) {
      return this.emitError(client, 'receiverId or chatType is required');
    }
    if (payload.chatType == ChatType.Group) {
      const group = await this.groupService.findOneGroup({
        _id: payload.roomId,
      });
      if (!payload.roomId) {
        return this.emitError(client, 'roomId is required');
      }
      if (!group) {
        return this.emitError(client, 'This group not found');
      }
    }
    if (payload.roomId) {
      const room = await this.chatRoomService.findOneRoom({
        roomId: payload.roomId,
      });
      if (!room) {
        return this.emitError(client, 'Room is not found');
      }
      if (!room.users.includes(new Types.ObjectId(userId))) {
        return this.emitError(client, 'You are not a member of this room');
      }
    } else {
      newRoomId = await this.createRoomFn(userId, payload.receiverId);
    }
    if (!client.rooms.has(payload.roomId)) {
      client.join(newRoomId);
    }
    client.emit('roomJoin', { success: true, roomId: newRoomId });
  }

  @SubscribeMessage('leave_room')
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    await client.leave(payload.roomId);
    client.emit('left_room', { roomId: payload.roomId });
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      message: string;
      chatType: string;
      senderId: string;
      receiverId: string;
      roomId: string;
      msgType: string;
    },
  ) {
    try {
      const { message, chatType, senderId, receiverId, roomId, msgType } =
        payload;
      if (!chatType || !senderId || !receiverId || !roomId || !msgType) {
        return this.emitError(client, 'required field is missing');
      }
      const room = await this.chatRoomService.findOneRoom({ roomId });
      if (!room) {
        return this.emitError(client, 'This room is not found');
      }
      const groupId = chatType == ChatType.Group ? roomId : undefined;
      const msgPayload: CreateMessageDto = {
        message,
        chatType,
        senderId,
        receiverId,
        messageType: msgType,
        roomId: room?._id.toString(),
        groupId,
      };
      const newMessage = await this.chatService.createMessage(msgPayload);
      this.server
        .to(roomId)
        .emit('receiveMessage', { success: true, data: newMessage });
    } catch (error) {
      console.log('send message error', error);
    }
  }

  private getUserIdFromClient(client: Socket): string | null {
    const handshakeUserId = client.handshake.query.userId as string;
    if (typeof handshakeUserId !== 'string' || !handshakeUserId.trim()) {
      return null;
    }

    return handshakeUserId.trim();
  }

  private emitError(client: Socket, message: string) {
    client.emit('chat_error', { message });
  }

  private async createRoomFn(userId: string, receiverId: string) {
    const roomId1 = userId + '_' + receiverId;
    const roomId2 = receiverId + '_' + userId;
    let room = await this.chatRoomService.findOneRoom({
      $or: [{ roomId: roomId1 }, { roomId: roomId2 }],
    });
    if (!room) {
      const roomPayload: CreateChatRoomDto = {
        roomId: roomId1,
        users: [userId, receiverId],
      };
      room = await this.chatRoomService.createRoom(roomPayload);
    }
    return room.roomId;
  }
}
