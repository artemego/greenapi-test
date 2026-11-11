import { z } from 'zod';

export const chatIdParamSchema = z.uuid('Chat id must be a uuid');

export const sendMessageSchema = z.object({
  // GREEN-API limit for sendMessage.
  text: z.string().trim().min(1, 'text must not be empty').max(4096, 'text is longer than 4096 characters'),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;

export const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  /** Cursor: only messages sent strictly before this time (the oldest `sentAt` you have). */
  before: z.iso
    .datetime({ offset: true })
    .transform((value) => new Date(value))
    .optional(),
});

export type HistoryQuery = z.infer<typeof historyQuerySchema>;
