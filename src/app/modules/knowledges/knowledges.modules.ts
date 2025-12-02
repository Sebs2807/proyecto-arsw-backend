// knowledge.module.ts
import { Module } from '@nestjs/common';

import { EmbeddingService } from '../ai/services/embeding-model.service';
import { KnowledgeController } from './knowledges.controller';
import { KnowledgeService } from './knowledges.service';

@Module({
  imports: [],
  controllers: [KnowledgeController],
  providers: [KnowledgeService, EmbeddingService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
