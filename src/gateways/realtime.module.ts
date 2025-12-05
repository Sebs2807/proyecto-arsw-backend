import { forwardRef, Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AiModule } from 'src/app/modules/ai/ai.module';
import { CardModule } from 'src/app/modules/cards/cards.module';

@Module({
  imports: [AiModule, forwardRef(() => CardModule)],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
