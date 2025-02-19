import { z } from 'zod';

export const GetMessagesSchema = z.object({
  conversationId: z.string().min(1, 'O ID da conversa é obrigatório'),
});

export type GetMessagesDtoType = z.infer<typeof GetMessagesSchema>;
