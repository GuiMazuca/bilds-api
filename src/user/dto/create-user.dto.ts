import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  cep: z.string().regex(/^\d{5}\d{3}$/, 'Invalid CEP format'),
  phone: z.string().regex(/^\d{2}\d{4,5}\d{4}$/, 'Invalid Phone format'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
});

export type CreateUserDtoType = z.infer<typeof CreateUserSchema>;
