// ai.module.ts
import { Module } from '@nestjs/common';
import { EmbeddingService } from './services/embeding-model.service';
import { OpenAILiveService } from './services/openAi-live.service';
import { AgentsModule } from '../agents/agents.module';
import { KnowledgeModule } from '../knowledges/knowledges.modules';

@Module({
  imports: [AgentsModule, KnowledgeModule],
  providers: [EmbeddingService, OpenAILiveService],
  exports: [EmbeddingService, OpenAILiveService],
})
export class AiModule {}
