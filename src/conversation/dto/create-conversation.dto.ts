import { z } from 'zod';

export const CreateConversationSchema = z.object({
  user2Id: z.string().min(1, 'O ID do segundo usuário é obrigatório'),
});

export type CreateConversationDtoType = z.infer<
  typeof CreateConversationSchema
>;
