import { z } from 'zod';

export const SendMessageSchema = z.object({
  receiverId: z.string().min(1, 'O ID do destinatário é obrigatório'),
  content: z.string().min(1, 'A mensagem não pode estar vazia'),
});

export type SendMessageDtoType = z.infer<typeof SendMessageSchema>;
