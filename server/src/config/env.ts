import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  SERVER_PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/ai_mystery_room'),
  SESSION_SECRET: z.string().min(16).default('local-development-secret-change-before-deploy'),
  GEMINI_API_KEY: z.string().optional(), GEMINI_TEXT_MODEL: z.string().optional(),
  ENABLE_IMAGE_GENERATION: z.string().default('false'), GEMINI_IMAGE_MODEL: z.string().optional(),
  ENABLE_VIDEO_GENERATION: z.string().default('false'), GEMINI_VIDEO_MODEL: z.string().optional(),
  CASE_TTL_DAYS: z.coerce.number().positive().default(7), MAX_CASE_GENERATIONS_PER_HOUR: z.coerce.number().int().positive().default(5),
  GENERATION_TIMEOUT_MS: z.coerce.number().int().positive().default(180000),
});
export const env = envSchema.parse(process.env);
