import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'node:path';

dotenv.config({ quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  LIQUIDSOAP_HOST: z.string().default('localhost'),
  LIQUIDSOAP_PORT: z.coerce.number().default(9080),
  AUDIO_DIR: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.error('Invalid environment configuration:', z.prettifyError(parsedEnv.error));
  process.exit(1);
}

interface QueueDef {
  NAME: string;
  JOBS: Record<string, string>
}

const queues = {
  DOWNLOAD_REQUEST: {
    NAME: 'download-requests',
    JOBS: {
      TRACK: 'track',
      REQUEST_TRACK: 'request-track',
      ROTATION_TRACK: 'rotation-track'
    }
  }
} as const satisfies Record<string, QueueDef>;

const settings = {
  NODE_ENV: parsedEnv.data.NODE_ENV,

  REDIS_HOST: parsedEnv.data.REDIS_HOST,
  REDIS_PORT: parsedEnv.data.REDIS_PORT,

  LIQUIDSOAP_HOST: parsedEnv.data.LIQUIDSOAP_HOST,
  LIQUIDSOAP_PORT: parsedEnv.data.LIQUIDSOAP_PORT,

  TRACKS_DIRECTORY: path.join(parsedEnv.data.AUDIO_DIR, 'tracks'),
  PLAYLISTS_DIRECTORY: path.join(parsedEnv.data.AUDIO_DIR, 'playlists'),

  QUEUES: queues

} as const;

console.log(settings);


export default settings;