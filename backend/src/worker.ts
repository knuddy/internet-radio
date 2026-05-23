import { Worker, Job } from 'bullmq';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';
import settings from '@src/settings';
import type { TrackDownloadInfo } from '@src/services/track-download';
import { LiquidsoapApiService } from '@src/services/liquidsoap-api';
import { PlaylistService } from '@src/services/playlist';

const execAsync = promisify(exec);

const liquidsoap = new LiquidsoapApiService();
const playlistService = new PlaylistService();

async function downloadTrack(url: string): Promise<string | null> {
  await fs.mkdir(settings.TRACKS_DIRECTORY, { recursive: true });
  const outputFilepath = path.join(settings.TRACKS_DIRECTORY, '%(id)s.%(ext)s');

  const command = [
    'yt-dlp',
    '--extract-audio',
    '--audio-format', 'mp3',
    '--audio-quality', '0', // 0 = best quality VBR
    '--output', outputFilepath,
    '--print', 'after_move:filepath', // Prints the final absolute path of the converted .mp3
    url
  ].join(' ');

  try {
    console.log(`Starting download for: ${url}`);
    const { stdout, stderr } = await execAsync(command);

    if (stderr && stderr.includes('WARNING')) {
      console.warn(`yt-dlp warning/stderr:`, stderr);
    }

    // Clean up stdout to get the exact file path inside the container
    const absoluteFilePath = stdout.trim();
    if (!absoluteFilePath) {
      console.error(`Could not determine downloaded file path from yt-dlp.`);
      return null;
    }

    console.log(`Download completed successfully. Track saved to ${absoluteFilePath}`);

    return absoluteFilePath;
  } catch (error) {
    console.error('Could not downloaded track from yt-dlp', error);
    return null;
  }
}

async function trackJob(job: Job<TrackDownloadInfo>) {
  const filepath = await downloadTrack(job.data.url);
  if (filepath == null) {
    throw new Error('Download failed');
  }
}

async function requestTrackJob(job: Job<TrackDownloadInfo>) {
  const filepath = await downloadTrack(job.data.url);
  if (filepath == null) {
    throw new Error('Download failed');
  }

  const enqueued = await liquidsoap.enqueueSinglePlayTrack(filepath);
  if (!enqueued) {
    throw new Error('Failed to enqueue track');
  }
}

async function rotationTrackJob(job: Job<TrackDownloadInfo>) {
  const filepath = await downloadTrack(job.data.url);
  if (filepath == null) {
    throw new Error('Download failed');
  }

  const added = await playlistService.addToRotation(filepath);
  if (!added) {
    throw new Error('Failed to add track to rotation playlist');
  }

  const reloaded = await liquidsoap.reloadRotationPlaylist();
  if (!reloaded) {
    throw new Error("Failed to reload liquidsoap rotation playlist");
  }
}

async function jobRouter(job: Job) {
  switch (job.name) {
    case settings.QUEUES.DOWNLOAD_REQUEST.JOBS.TRACK:
      return await trackJob(job);
    case settings.QUEUES.DOWNLOAD_REQUEST.JOBS.REQUEST_TRACK:
      return await requestTrackJob(job);
    case settings.QUEUES.DOWNLOAD_REQUEST.JOBS.ROTATION_TRACK:
      return await rotationTrackJob(job);
    default:
      throw new Error(`Unknown job type: ${job.name}`);
  }
}

const worker = new Worker(
  settings.QUEUES.DOWNLOAD_REQUEST.NAME,
  jobRouter,
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

console.log(`Worker listening to download-queue and ready for jobs`);