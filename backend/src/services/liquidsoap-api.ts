import settings from '@src/settings';
import axios, { type AxiosInstance } from 'axios';
import { getLiquidsoapContainerRelativeAudioPath } from '@src/utils/liquidsoap-path';

export class LiquidsoapApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `http://${settings.LIQUIDSOAP_HOST}:${settings.LIQUIDSOAP_PORT}`,
      validateStatus: () => true // Tells Axios not to throw errors on 4xx/5xx codes
    });
  }

  async enqueueSinglePlayTrack(filepath: string): Promise<boolean> {
    const containerPath = await getLiquidsoapContainerRelativeAudioPath(filepath);
    if (containerPath == null) return false;

    try {
      const response = await this.api.post('/enqueue', { path: containerPath });
      return response.status === 200;
    } catch (error) {
      console.error("POST request to Liquidsoap endpoint /enqueue failed.");
      return false;
    }
  }

  async reloadRotationPlaylist(): Promise<boolean> {
    try {
      const response = await this.api.post('/reload', {});
      return response.status === 200;
    }catch (error) {
      console.error("POST request to Liquidsoap endpoint /reload failed.");
      return false;
    }
  }

  async skipCurrentTrack(): Promise<boolean> {
    try {
      const response = await this.api.post('/skip', {});
      return response.status === 200;
    }catch (error) {
      console.error("POST request to Liquidsoap endpoint /skip failed.");
      return false;
    }
  }
}