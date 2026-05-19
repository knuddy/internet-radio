import { Worker, Job } from 'bullmq';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';
import settings from '@src/settings';

const execAsync = promisify(exec);

interface SongDownloadRequest {
  url: string;
}

async function songDownloadJob(job: Job<SongDownloadRequest>) {
  const { url } = job.data;

  await fs.mkdir(settings.DOWNLOAD_OUTPUT_DIRECTORY, { recursive: true });
  const outputFilepath = path.join(settings.DOWNLOAD_OUTPUT_DIRECTORY, '%(title)s.%(ext)s');

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
  settings.QUEUES.DOWNLOAD_REQUEST,
  songDownloadJob,
  {
    connection: {
      host: settings.REDIS_HOST,
      port: settings.REDIS_PORT
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

console.log(`Worker processing 'download-queue' connected to Redis at ${settings.REDIS_HOST}:${settings.REDIS_PORT}`);