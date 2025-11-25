// ai.module.ts
import { Module } from '@nestjs/common';
import { EmbeddingService } from './embeding-model.service';

@Module({
  providers: [EmbeddingService],
  exports: [EmbeddingService],
})
export class AiModule {}
