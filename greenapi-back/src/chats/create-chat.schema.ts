import { z } from 'zod';

export const createChatSchema = z.object({
  // Accepts "+7 (987) 654-32-10", "79876543210" or a number; keeps digits only.
  phoneNumber: z
    .union([z.string(), z.number()])
    .transform((value) => String(value).replace(/\D/g, ''))
    .pipe(
      z
        .string()
        .min(7, 'phoneNumber must have 7 to 15 digits')
        .max(15, 'phoneNumber must have 7 to 15 digits'),
    ),
});

export type CreateChatDto = z.infer<typeof createChatSchema>;
