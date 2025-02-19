import { z } from 'zod';

export const DeleteMessageSchema = z.object({
  messageId: z.string().min(1, 'O ID da mensagem é obrigatório'),
  userId: z.string().min(1, 'O ID do usuário é obrigatório'),
});

export type DeleteMessageDtoType = z.infer<typeof DeleteMessageSchema>;
