// src/livekit/livekit.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { LivekitService } from './livekit.service';

@Controller('livekit')
export class LivekitController {
  constructor(private readonly livekitService: LivekitService) {}

  @Get('token')
  async getToken(
    @Query('room') room: string,
    @Query('identity') identity: string,
    @Query('name') displayName?: string,
  ) {
    const token = await this.livekitService.generateToken(room, identity, displayName);

    return { token, url: this.livekitService.getServerUrl() };
  }
}
