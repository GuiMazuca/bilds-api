import { z } from 'zod';

export const GetUserConversationsSchema = z.object({
  userId: z.string().min(1, 'O ID do usuário é obrigatório'),
});

export type GetUserConversationsDtoType = z.infer<
  typeof GetUserConversationsSchema
>;
