import settings from '@src/settings';
import { Command } from 'commander';
import { Queue } from 'bullmq';
import { TrackDownloadService } from '@src/services/track-download';
import { LiquidsoapApiService } from '@src/services/liquidsoap-api';
import { PlaylistService } from '@src/services/playlist';
import path from 'node:path';

const program = new Command();

async function withTrackDownloadService(action: (service: TrackDownloadService) => Promise<string | undefined>) {
  const queue = new Queue(settings.QUEUES.DOWNLOAD_REQUEST.NAME, {
    connection: { host: settings.REDIS_HOST, port: settings.REDIS_PORT }
  });
  const service = new TrackDownloadService(queue);

  try {
    const jobId = await action(service);
    console.log(`Job id is ${jobId}`);
  } catch (error) {
    console.error("Operation failed:", error);
  } finally {
    await queue.close();
  }
}

program
  .name("backend-management")
  .description("Management CLI utilities for the backend system.")
  .version('1.0.0')

program
  .command('track_download')
  .description("Provide a YouTube video URL to a enqueue a track download. Playlists are not accepted.")
  .argument('<url>', 'The YouTube video URL')
  .action((url) => withTrackDownloadService(s => s.enqueueTrackDownload(url)));

program
  .command('request_track_download')
  .description("Provide a YouTube video URL to enqueue a request track download. Playlists are not accepted.")
  .argument('<url>', 'The YouTube video URL')
  .action((url) => withTrackDownloadService(s => s.enqueueRequestTrackDownload(url)));

program
  .command('rotation_track_download')
  .description("Provide a YouTube video URL to add to the rotation track download. Playlists are not accepted.")
  .argument('<url>', 'The YouTube video URL')
  .action((url) => withTrackDownloadService(s => s.enqueueRotationTrackDownload(url)));

program
  .command('rotation_track_existing')
  .description("Adding existing track to rotation")
  .argument('<trackName>', 'The track name to add to the rotation playlist. It must be inside the /track directory')
  .action(async (trackName: string) => {
    const liquidsoapService = new LiquidsoapApiService();
    const playlistService = new PlaylistService();

    const fullTrackPath = path.join(settings.TRACKS_DIRECTORY, trackName);

    const added = await playlistService.addToRotation(fullTrackPath);
    if (!added) {
      console.error(`Failed to add track ${trackName} to rotation playlist`);
      return;
    }

    const reloaded = await liquidsoapService.reloadRotationPlaylist();
    if (!reloaded) {
      console.error('Failed to reload the Liquidsoap rotation playlist');
      return;
    }

    console.log("Successfully added track to rotation playlist");
  });

program
  .command('skip_current')
  .description("Skip currently playing track on the radio station")
  .action(async () => {
    const liquidsoapService = new LiquidsoapApiService();

    const reloaded = await liquidsoapService.skipCurrentTrack();
    if (!reloaded) {
      console.error('Failed to skip current track playing on the Liquidsoap station');
      return;
    }

    console.log("Successfully skipped current track");
  });


program.parse(process.argv);