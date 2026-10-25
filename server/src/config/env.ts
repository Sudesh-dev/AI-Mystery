import dotenv from 'dotenv';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  SERVER_PORT: z.coerce.number().int().positive().default(Number(process.env.PORT ?? 5000)),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/ai_mystery_room'),
  SESSION_SECRET: z.string().min(16).default('local-development-secret-change-before-deploy'),
  GEMINI_API_KEY: z.string().optional(), GEMINI_TEXT_MODEL: z.string().optional(),
  ENABLE_IMAGE_GENERATION: z.string().default('false'), GEMINI_IMAGE_MODEL: z.string().optional(),
  ENABLE_VIDEO_GENERATION: z.string().default('false'), GEMINI_VIDEO_MODEL: z.string().optional(),
  CASE_TTL_DAYS: z.coerce.number().positive().default(7), MAX_CASE_GENERATIONS_PER_HOUR: z.coerce.number().int().positive().default(5),
  GENERATION_TIMEOUT_MS: z.coerce.number().int().positive().default(300000),
  MEDIA_STORAGE_DIR: z.string().default('uploads'),
});
const parsedEnv = envSchema.parse(process.env);
if (parsedEnv.NODE_ENV === 'production') {
  const problems: string[] = [];
  if (parsedEnv.SESSION_SECRET.length < 32 || parsedEnv.SESSION_SECRET === 'local-development-secret-change-before-deploy') problems.push('SESSION_SECRET must be a unique random value of at least 32 characters');
  if (/localhost|127\.0\.0\.1/.test(parsedEnv.MONGODB_URI)) problems.push('MONGODB_URI must point to a hosted database');
  if (!parsedEnv.GEMINI_API_KEY) problems.push('GEMINI_API_KEY is required');
  if (!parsedEnv.GEMINI_TEXT_MODEL) problems.push('GEMINI_TEXT_MODEL is required');
  if (!/^https:\/\//.test(parsedEnv.CLIENT_ORIGIN)) problems.push('CLIENT_ORIGIN must use HTTPS');
  if (problems.length) throw new Error(`Invalid production configuration: ${problems.join('; ')}`);
}
export const env = { ...parsedEnv, MEDIA_STORAGE_DIR: isAbsolute(parsedEnv.MEDIA_STORAGE_DIR) ? parsedEnv.MEDIA_STORAGE_DIR : resolve(process.cwd(), parsedEnv.MEDIA_STORAGE_DIR) };
