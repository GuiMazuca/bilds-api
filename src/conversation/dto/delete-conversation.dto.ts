import { z } from 'zod';

export const DeleteConversationSchema = z.object({
  conversationId: z.string().min(1, 'O ID da conversa é obrigatório'),
});

export type DeleteConversationDtoType = z.infer<
  typeof DeleteConversationSchema
>;
