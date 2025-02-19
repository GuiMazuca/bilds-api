import { z } from 'zod';

export const MarkAsSeenSchema = z.object({
  conversationId: z.string().min(1, 'O ID da conversa é obrigatório'),
});

export type MarkAsSeenDtoType = z.infer<typeof MarkAsSeenSchema>;
