import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Message } from './message.schema';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participants: User[];

  @Prop({ type: Types.ObjectId, ref: 'Message', default: null })
  lastMessage: Message;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
