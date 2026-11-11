import { z } from 'zod';

/** Hosts GREEN-API serves from (`api.green-api.com`, `7103.api.greenapi.com`, ...). */
const GREEN_API_HOST = /(^|\.)(green-api|greenapi)\.com$/;

export const loginSchema = z.object({
  // The console shows idInstance as a number; accept both forms.
  idInstance: z
    .union([z.string(), z.number()])
    .transform((value) => String(value).trim())
    .pipe(z.string().regex(/^\d+$/, 'idInstance must contain digits only')),
  apiTokenInstance: z.string().trim().min(1),
  // The server calls this URL with the token in it, so only GREEN-API hosts are
  // accepted: anything else would leak the token or turn login into an SSRF.
  apiUrl: z
    .url({ protocol: /^https$/, hostname: GREEN_API_HOST })
    .transform((value) => value.replace(/\/+$/, ''))
    .optional(),
});

export type LoginDto = z.infer<typeof loginSchema>;
