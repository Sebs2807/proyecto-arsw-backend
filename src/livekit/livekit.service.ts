import { Injectable } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LivekitService {
  private readonly apiKey = process.env.LIVEKIT_API_KEY;
  private readonly apiSecret = process.env.LIVEKIT_API_SECRET;
  private readonly serverUrl = process.env.LIVEKIT_URL;

  getServerUrl() {
    return this.serverUrl;
  }

  async generateToken(room: string, identity: string, displayName?: string): Promise<string> {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity,
      name: displayName ?? identity,
    });

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
    });

    return at.toJwt();
  }
}
