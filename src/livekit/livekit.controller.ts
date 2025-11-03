// src/livekit/livekit.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { LivekitService } from './livekit.service';

@Controller('livekit')
export class LivekitController {
  constructor(private readonly livekitService: LivekitService) {}

  @Get('token')
  async getToken(@Query('room') room: string, @Query('name') name: string) {
    const token = await this.livekitService.generateToken(room, name);
    console.log('Token generado:', token);
    const url = this.livekitService.getServerUrl();
    return { token, url };
  }
}
