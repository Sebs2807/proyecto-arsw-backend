import { Module } from '@nestjs/common';
import { TwilioController } from './twilio.controller';
import { TwilioService } from './twilio.service';
import { ConfigModule } from '@nestjs/config';
import { CardModule } from '../cards/cards.module';
import { AgentsModule } from '../agents/agents.module';
import { AiModule } from '../ai/ai.module'; // Este módulo exporta OpenAILiveService
import { ElevenLabsModule } from '../eleven-labs/eleven-labs.module';
import { KnowledgeModule } from '../knowledges/knowledges.modules';

@Module({
  imports: [ConfigModule, CardModule, AgentsModule, AiModule, ElevenLabsModule, KnowledgeModule],
  controllers: [TwilioController],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
