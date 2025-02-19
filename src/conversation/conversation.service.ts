import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import {
  Conversation,
  ConversationDocument,
} from '../schemas/conversation.schema';
import { DeleteConversationDtoType } from './dto/delete-conversation.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async getOrCreateConversation(user1Id: string, user2Id: string) {
    let conversation = await this.conversationModel.findOne({
      $and: [{ 'participants.id': user1Id }, { 'participants.id': user2Id }],
    });

    if (!conversation) {
      conversation = await this.conversationModel.create({
        participants: [{ id: user1Id }, { id: user2Id }],
      });

      await conversation.populate('participants', 'name email');
    }

    return conversation;
  }

  async getUserConversations(userId: string) {
    const currentConversations = await this.conversationModel
      .find({ 'participants.id': userId })
      .populate('participants', 'name email')
      .populate('lastMessage');

    const conversationsWithUsers = await Promise.all(
      currentConversations.map(async (conversation) => {
        let secondParticipant: any = conversation.participants.find(
          (participant: any) => participant.id !== userId,
        );

        if (!secondParticipant && conversation.participants.length > 1) {
          secondParticipant = conversation.participants[1];
        }

        const secondUser = secondParticipant
          ? await this.userService.findBy_id(secondParticipant.id.toString())
          : null;

        return { ...conversation.toObject(), secondUser };
      }),
    );

    return { conversations: conversationsWithUsers };
  }

  async findById(conversationId: string) {
    return this.conversationModel.findById(conversationId);
  }

  async findByUserId(userId: string) {
    const conversations = await this.conversationModel.find();
    const userConversations = conversations.filter((conversation) => {
      return conversation.participants.some((participant: any) => {
        return participant.id === userId;
      });
    });
    return userConversations;
  }

  async deleteConversation(conversationId: DeleteConversationDtoType) {
    return this.conversationModel.findByIdAndDelete(conversationId);
  }
}
