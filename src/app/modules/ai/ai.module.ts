import { forwardRef, Module } from '@nestjs/common';
import { EmbeddingService } from './services/embeding-model.service';
import { OpenAILiveService } from './services/openAi-live.service';
import { AgentsModule } from '../agents/agents.module';
import { KnowledgeModule } from '../knowledges/knowledges.modules';
import { CardModule } from '../cards/cards.module';

@Module({
  imports: [AgentsModule, KnowledgeModule, forwardRef(() => CardModule)],
  providers: [EmbeddingService, OpenAILiveService],
  exports: [EmbeddingService, OpenAILiveService],
})
export class AiModule {}
