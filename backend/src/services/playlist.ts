import fs from 'node:fs/promises';
import path from 'node:path';
import settings from '@src/settings';
import { getLiquidsoapContainerRelativeAudioPath } from '@src/utils/liquidsoap-path';

export class PlaylistService {
  private playlistFile = path.join(settings.PLAYLISTS_DIRECTORY, 'rotation.m3u');

  /**
   * Adds a track path to the rotation playlist
   */
  async addToRotation(filepath: string): Promise<boolean> {
    const containerPath = await getLiquidsoapContainerRelativeAudioPath(filepath);
    if (containerPath == null) return false;

    await fs.mkdir(settings.PLAYLISTS_DIRECTORY, { recursive: true });
    await fs.appendFile(this.playlistFile, `${containerPath}\n`, 'utf-8');

    return true;
  }
}