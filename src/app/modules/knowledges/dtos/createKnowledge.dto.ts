import { IsEnum, IsOptional, IsString, IsArray, ArrayNotEmpty } from 'class-validator';
import * as knowledgesController from '../knowledges.controller';

export class CreateKnowledgeDto {
  @IsString()
  title: string;

  @IsString()
  text: string;

  @IsEnum(['product_feature', 'pricing', 'objection', 'flow_step', 'legal', 'faq'])
  category: knowledgesController.KnowledgeCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  agentId?: string; // ID del agente para asociar el conocimiento

  @IsOptional()
  metadata?: Record<string, any>; // puedes dejarlo si quieres datos adicionales
}