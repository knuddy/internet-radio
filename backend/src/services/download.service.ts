import { Queue } from 'bullmq';
import settings from '../settings';

// Lazy initialise the download queue it doesn't need to be created when the file
// is first imported.
let downloadQueue: Queue | null = null;

function getDownloadQueue(): Queue {
  if (!downloadQueue) {
    downloadQueue = new Queue(
      settings.QUEUES.DOWNLOAD_REQUEST,
      {
        connection: {
          host: settings.REDIS_HOST,
          port: settings.REDIS_PORT
        }
      }
    );
  }
  return downloadQueue;
}

export async function queueDownloadRequest(url: string) {
  const queue = getDownloadQueue();
  const job = await queue.add('download-job', { url });
  return { jobId: job.id };
}