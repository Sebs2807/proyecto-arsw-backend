import { Module } from '@nestjs/common';
import { TwilioController } from './twilio.controller';
import { TwilioService } from './twilio.service';
import { ConfigModule } from '@nestjs/config';
import { CardModule } from '../cards/cards.module';
import { AgentsModule } from '../agents/agents.module';
import { AiModule } from '../ai/ai.module';
import { KnowledgeModule } from '../knowledges/knowledges.modules';

@Module({
  imports: [ConfigModule, CardModule, AgentsModule, AiModule, KnowledgeModule],
  controllers: [TwilioController],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
