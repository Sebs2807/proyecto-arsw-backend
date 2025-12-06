import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import * as knowledgesController from '../knowledges.controller';

export const KnowledgeCategories = [
  'product_feature',
  'pricing',
  'objection',
  'flow_step',
  'legal',
  'faq',
] as const;

export class KnowledgeDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsIn(KnowledgeCategories)
  category: knowledgesController.KnowledgeCategory;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
