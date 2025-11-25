import { Body, Controller, Post } from '@nestjs/common';
import { CallService } from './calls.service';

export class StartCallDto {
  agentId: string;
  cardId: string;
}

@Controller('calls')
export class CallController {
  constructor(private callService: CallService) {}

  @Post('start')
  async startCall(@Body() body: StartCallDto) {
    return this.callService.startCall(body.agentId, body.cardId);
  }
}
