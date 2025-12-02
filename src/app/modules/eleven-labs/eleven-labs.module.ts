import { Module } from '@nestjs/common';
import { ElevenLabsService } from './eleven-labs.service';

@Module({
  providers: [ElevenLabsService],
  exports: [ElevenLabsService],
})
export class ElevenLabsModule {}
