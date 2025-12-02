import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { ElevenLabsModule } from 'src/app/modules/eleven-labs/eleven-labs.module';
import { AiModule } from 'src/app/modules/ai/ai.module';

@Module({
  imports: [ElevenLabsModule, AiModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
