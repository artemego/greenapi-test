import { ConfigService } from '@nestjs/config';
import { z } from 'zod';

const url = z.url().transform((value) => value.replace(/\/+$/, ''));
// z.coerce.boolean() would turn the string "false" into true.
const flag = z.enum(['true', 'false']).transform((value) => value === 'true');

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
  DB_SSL: flag.default(false),
  // PEM of the CA that signed the server certificate, for hosts with a private CA (Supabase).
  // Turns SSL on by itself; literal "\n" is accepted for single-line env editors.
  DB_SSL_CA: z
    .string()
    .min(1)
    .transform((value) => value.replace(/\\n/g, '\n'))
    .optional(),
  // Unset: on outside production. Set to true in production only while there are no migrations.
  DB_SYNCHRONIZE: flag.optional(),

  GREEN_API_URL: url,
  FRONTEND_ORIGIN: url,
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),
});

export type Env = z.infer<typeof envSchema>;

/** ConfigService typed against the validated env: use `get('KEY', { infer: true })`. */
export type AppConfigService = ConfigService<Env, true>;
