// knowledge.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Patch,
  UseGuards,
  Logger,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KnowledgeService } from './knowledges.service';
import { KnowledgeDto } from './dtos/knowledge.dto';
import { CreateKnowledgeDto } from './dtos/createKnowledge.dto';

export type KnowledgeCategory =
  | 'product_feature'
  | 'pricing'
  | 'objection'
  | 'flow_step'
  | 'legal'
  | 'faq';

@Controller({ path: 'knowledges', version: '1' })
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  private readonly logger = new Logger(KnowledgeController.name);
  constructor(private readonly knowledegeService: KnowledgeService) {}

  @Post()
  create(@Body() dto: CreateKnowledgeDto) {
    console.log('Creating knowledge with data:', dto);
    return this.knowledegeService.createKnowledge(dto);
  }

  @Get('paginated')
  findAll() {
    return this.knowledegeService.getAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.knowledegeService.getOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: KnowledgeDto) {
    return this.knowledegeService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.knowledegeService.delete(id);
  }
}
