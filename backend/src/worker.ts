import { Worker, Job } from 'bullmq';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';
import dotenv from 'dotenv';
import { QUEUES } from './const.js';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const OUTPUT_DIR = process.env.DOWNLOADS_DIR || path.join(process.cwd(), 'downloads');

const execAsync = promisify(exec);


interface SongDownloadRequest {
  url: string;
}


async function songDownloadJob(job: Job<SongDownloadRequest>) {
  const { url } = job.data;

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const outputFilepath = path.join(OUTPUT_DIR, '%(title)s.%(ext)s');

  console.log(`[Job ${job.id}] Starting download for: ${url}`);

  try {
    const command = [
      'yt-dlp',
      '--extract-audio',
      '--audio-format mp3',
      '--audio-quality 0', // 0 = best quality VBR
      `--output "${outputFilepath}"`,
      `"${url}"`
    ].join(' ');

    await job.updateProgress(10);

    const { stderr } = await execAsync(command);

    if (stderr && stderr.includes('WARNING')) {
      console.warn(`[Job ${job.id}] yt-dlp warning/stderr:`, stderr);
    }

    await job.updateProgress(100);
    console.log(`[Job ${job.id}] Download completed successfully.`);

    return {
      success: true,
      message: 'Audio downloaded successfully'
    };
  } catch (error: any) {
    console.error(`[Job ${job.id}] Failed to download video:`, error.message);
    throw error;
  }

}

const worker = new Worker<SongDownloadRequest>(
  QUEUES.DOWNLOAD_REQUEST,
  songDownloadJob,
  {
    connection: {
      host: REDIS_HOST,
      port: REDIS_PORT
    }
  }
);

// Event listeners for monitoring local activity
worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} has failed with error: ${err.message}`);
});

console.log(`Worker processing 'download-queue' connected to Redis at ${REDIS_HOST}:${REDIS_PORT}`);