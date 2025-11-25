import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import * as knowledgesController from '../knowledges.controller';

export class UpdateKnowledgeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsEnum(['product_feature', 'pricing', 'objection', 'flow_step', 'legal', 'faq'])
  category?: knowledgesController.KnowledgeCategory;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
