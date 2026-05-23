import path from 'node:path';
import fs from 'node:fs/promises';

/**
 * Validates audio file existence and converts a local system path to a container-relative path for Liquidsoap.
 */
export async function getLiquidsoapContainerRelativeAudioPath(absoluteFilePath: string): Promise<string | null> {
  try {
    await fs.access(absoluteFilePath);
    const fileName = path.basename(absoluteFilePath);
    return `/audio/tracks/${fileName}`;
  } catch (error) {
    console.error(`Audio file validation failed: ${absoluteFilePath}`, error);
    return null;
  }
}