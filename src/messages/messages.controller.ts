import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/schemas/user.schema';
import {
  DeleteMessageDtoType,
  DeleteMessageSchema,
} from './dto/delete-message.dto';
import { MarkAsSeenDtoType, MarkAsSeenSchema } from './dto/mark-as-seen.dto';
import { SendMessageDtoType, SendMessageSchema } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @Body(new ZodValidationPipe(SendMessageSchema)) body: SendMessageDtoType,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.sendMessage(
      user.userId,
      body.receiverId,
      body.content,
    );
  }

  @Get(':conversationId')
  @UseGuards(JwtAuthGuard)
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.messagesService.getMessages(conversationId);
  }

  @Patch('seen/:conversationId')
  @UseGuards(JwtAuthGuard)
  async markAsSeen(
    @Param(new ZodValidationPipe(MarkAsSeenSchema)) params: MarkAsSeenDtoType,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.markAsSeen(params.conversationId, user.userId);
  }

  @Delete(':messageId')
  @UseGuards(JwtAuthGuard)
  async deleteMessage(
    @Param(new ZodValidationPipe(DeleteMessageSchema))
    params: DeleteMessageDtoType,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.deleteMessage(params.messageId, user.userId);
  }
}
