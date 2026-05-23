import { Queue } from 'bullmq';
import settings from '@src/settings';

export interface TrackDownloadInfo {
  url: string;
}

export class TrackDownloadService {
  private queue: Queue;

  constructor(queue: Queue) {
    this.queue = queue;
  }

  private async enqueue(jobType: string, url: string) {
    const job = await this.queue.add(jobType, { url });
    return job.id;
  }

  async enqueueTrackDownload(url: string) {
    return this.enqueue(settings.QUEUES.DOWNLOAD_REQUEST.JOBS.TRACK, url);
  }

  async enqueueRequestTrackDownload(url: string) {
    return this.enqueue(settings.QUEUES.DOWNLOAD_REQUEST.JOBS.REQUEST_TRACK, url);
  }

  async enqueueRotationTrackDownload(url: string) {
    return this.enqueue(settings.QUEUES.DOWNLOAD_REQUEST.JOBS.ROTATION_TRACK, url);
  }
}