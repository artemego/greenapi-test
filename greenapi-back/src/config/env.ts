import { ConfigService } from '@nestjs/config';
import { z } from 'zod';

const url = z.url().transform((value) => value.replace(/\/+$/, ''));

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),

  GREEN_API_URL: url,
  FRONTEND_ORIGIN: url,
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),
});

export type Env = z.infer<typeof envSchema>;

/** ConfigService typed against the validated env: use `get('KEY', { infer: true })`. */
export type AppConfigService = ConfigService<Env, true>;
