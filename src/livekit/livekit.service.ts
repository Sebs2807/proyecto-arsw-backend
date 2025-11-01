// src/livekit/livekit.service.ts
import { Injectable } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LivekitService {
  private readonly apiKey = process.env.LIVEKIT_API_KEY!;
  private readonly apiSecret = process.env.LIVEKIT_API_SECRET!;
  private readonly livekitUrl = process.env.LIVEKIT_URL!;

  async generateToken(roomName: string, participantName: string): Promise<string> {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    return await at.toJwt();
  }

  getServerUrl(): string {
    return this.livekitUrl;
  }
}
