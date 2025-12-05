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
  Query, // AÑADIDO
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KnowledgeService } from './knowledges.service';
import { KnowledgeDto } from './dtos/knowledge.dto';
import { CreateKnowledgeDto } from './dtos/createKnowledge.dto';
import { QueryKnowledgeDto } from './dtos/queryKnowledge.dto'; // AÑADIDO

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
  // Constructor corregido (typo: knowledegeService -> knowledgeService)
  constructor(private readonly knowledgeService: KnowledgeService) {} 

  @Post()
  create(@Body() dto: CreateKnowledgeDto) {
    console.log('Creating knowledge with data:', dto);
    return this.knowledgeService.createKnowledge(dto);
  }

  @Get('paginated')
  // MODIFICADO: Aceptar parámetros de query para paginación y filtros
  async findAll(@Query() query: QueryKnowledgeDto) { 
    return this.knowledgeService.getPaginated({
      page: query.page,
      limit: query.limit,
      search: query.search,
      agentId: query.workspaceId, // Usamos workspaceId como filtro de agentId
      category: query.category,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.knowledgeService.getOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: KnowledgeDto) {
    return this.knowledgeService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.knowledgeService.delete(id);
  }
}