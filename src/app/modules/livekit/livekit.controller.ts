import { Controller, Get, Query } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';

@Controller('livekit')
export class LiveKitController {
  @Get('token')
  getToken(@Query('room') room: string, @Query('name') name: string) {
    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: name,
    });

    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    return { token: at.toJwt() };
  }
}
