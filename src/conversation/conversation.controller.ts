import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/schemas/user.schema';
import { ConversationService } from './conversation.service';
import {
  CreateConversationDtoType,
  CreateConversationSchema,
} from './dto/create-conversation.dto';
import {
  DeleteConversationDtoType,
  DeleteConversationSchema,
} from './dto/delete-conversation.dto';
import { GetUserConversationsSchema } from './dto/get-user-conversation.dto';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async getOrCreateConversation(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(CreateConversationSchema))
    body: CreateConversationDtoType,
  ) {
    return this.conversationService.getOrCreateConversation(
      user.userId,
      body.user2Id,
    );
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(GetUserConversationsSchema))
  async getUserConversations(@CurrentUser() user: User) {
    return this.conversationService.getUserConversations(user.userId);
  }

  @Delete(':conversationId')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(DeleteConversationSchema))
  async deleteConversation(
    @Param('conversationId') conversationId: DeleteConversationDtoType,
  ) {
    return this.conversationService.deleteConversation(conversationId);
  }
}
