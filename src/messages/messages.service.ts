import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConversationService } from '../conversation/conversation.service';
import { Message, MessageDocument } from '../schemas/message.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private conversationService: ConversationService,
    private eventEmitter: EventEmitter2,
  ) {}

  async sendMessage(senderId: string, receiverId: string, content: string) {
    const conversation = await this.conversationService.getOrCreateConversation(
      senderId,
      receiverId,
    );

    const message = await this.messageModel.create({
      conversation: conversation._id,
      sender: senderId,
      content,
      seen: false,
    });

    await conversation.updateOne({ lastMessage: message._id });

    const populatedMessage = await message.populate('sender', 'name email');

    return populatedMessage;
  }

  async getMessages(conversationId: string) {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new Error('ID da conversa inválido');
    }

    const messages = await this.messageModel
      .find({ conversation: new Types.ObjectId(conversationId) })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    return messages;
  }

  async markAsSeen(conversationId: string, userId: string) {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new Error('ID da conversa inválido');
    }

    const conversation =
      await this.conversationService.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversa não encontrada');
    }

    const otherUserId = conversation.participants.find(
      (participant) => participant.toString() !== userId,
    );

    if (!otherUserId) {
      throw new Error('Outro participante não encontrado');
    }

    await this.messageModel.updateMany(
      { conversation: conversationId, sender: otherUserId, seen: false },
      { $set: { seen: true } },
    );

    this.eventEmitter.emit('messages.seen', { conversationId });

    return { message: 'Mensagens marcadas como vistas' };
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.messageModel.findById(messageId);
    if (!message) throw new Error('Mensagem não encontrada');
    if (message.sender.toString() !== userId)
      throw new Error('Usuário não autorizado');

    await this.messageModel.findByIdAndDelete(messageId);

    this.eventEmitter.emit('message.deleted', { messageId });

    return { message: 'Mensagem deletada com sucesso' };
  }
}
