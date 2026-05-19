import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'node:path';

dotenv.config({ quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  DOWNLOADS_DIR: z.string().optional()
});


const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.error('Invalid environment configuration:', z.prettifyError(parsedEnv.error));
  process.exit(1);
}

const queues = {
  DOWNLOAD_REQUEST: 'download-request-queue'
} as const;

const settings = {
  NODE_ENV: parsedEnv.data.NODE_ENV,

  REDIS_HOST: parsedEnv.data.REDIS_HOST,
  REDIS_PORT: parsedEnv.data.REDIS_PORT,

  DOWNLOAD_OUTPUT_DIRECTORY: parsedEnv.data.DOWNLOADS_DIR || path.join(process.cwd(), 'downloads'),

  QUEUES: queues

} as const;

export default settings;