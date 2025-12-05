// ai.module.ts (CORRECTED)
import { forwardRef, Module } from '@nestjs/common'; // <-- Import forwardRef
import { EmbeddingService } from './services/embeding-model.service';
import { OpenAILiveService } from './services/openAi-live.service';
import { AgentsModule } from '../agents/agents.module';
import { KnowledgeModule } from '../knowledges/knowledges.modules';
import { CardModule } from '../cards/cards.module'; // <-- Import CardModule

@Module({
  imports: [
    AgentsModule,
    KnowledgeModule,
    // CRITICAL: Import CardModule using forwardRef
    forwardRef(() => CardModule),
  ],
  providers: [EmbeddingService, OpenAILiveService],
  exports: [EmbeddingService, OpenAILiveService],
})
export class AiModule {}
