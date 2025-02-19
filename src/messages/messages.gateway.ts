import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

import { createHash } from 'crypto';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    const { currentUser, receiverId } = client.handshake.query;
    if (currentUser && receiverId) {
      const roomId = this.generateRoomId(
        currentUser as string,
        receiverId as string,
      );

      client.join(roomId);
      console.log(`Client ${client.id} joined room: ${roomId}`);
    }
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: { receiverId: string; currentUser: string; content: string },
  ) {
    const { currentUser, receiverId, content } = payload;
    const roomId = this.generateRoomId(currentUser, receiverId);
    const message = await this.messagesService.sendMessage(
      currentUser,
      receiverId,
      content,
    );

    this.server.to(roomId).emit('newMessage', message);
    console.log(`Message sent to room: ${roomId}`);
  }

  @OnEvent('message.sent')
  handleMessageSent(payload: { receiverId: string; message: any }) {
    const roomId = this.generateRoomId(
      payload.message.sender,
      payload.receiverId,
    );
    this.server.to(roomId).emit('newMessage', payload.message);
    console.log(`Message sent to room: ${roomId}`);
  }

  @OnEvent('messages.seen')
  handleMessagesSeen(payload: { conversationId: string }) {
    this.server.to(payload.conversationId).emit('messagesSeen', payload);
  }

  @OnEvent('message.deleted')
  handleMessageDeleted(payload: { messageId: string }) {
    this.server.to(payload.messageId).emit('messageDeleted', payload);
  }

  private generateRoomId(currentUser: string, receiverId: string): string {
    return createHash('sha256')
      .update([currentUser, receiverId].sort().join('-'))
      .digest('hex');
  }
}
