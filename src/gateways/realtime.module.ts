import { forwardRef, Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { ElevenLabsModule } from 'src/app/modules/eleven-labs/eleven-labs.module';
import { AiModule } from 'src/app/modules/ai/ai.module';
import { CardModule } from 'src/app/modules/cards/cards.module';

@Module({
  imports: [ElevenLabsModule, AiModule, forwardRef(() => CardModule)],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
