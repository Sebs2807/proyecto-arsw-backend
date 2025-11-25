import { IsEnum, IsOptional, IsString } from 'class-validator';

import { Type } from 'class-transformer';

type KnowledgeCategory =
  | 'product_feature'
  | 'pricing'
  | 'objection'
  | 'flow_step'
  | 'legal'
  | 'faq';

export class QueryKnowledgeDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['product_feature', 'pricing', 'objection', 'flow_step', 'legal', 'faq'])
  category?: KnowledgeCategory;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
