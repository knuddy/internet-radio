export const QUEUES = {
  DOWNLOAD_REQUEST: 'download-request-queue'
} as const;

export type QueueName = typeof QUEUES[keyof typeof QUEUES];