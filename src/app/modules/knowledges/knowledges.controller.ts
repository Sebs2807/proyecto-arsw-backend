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
import { KnowledgeService } from './knowledge.service';
import { KnowledgeDto } from './knowledge.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller({ path: 'knowledges', version: '1' })
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  private readonly logger = new Logger(KnowledgeController.name);
  constructor(private readonly knowledegeService: KnowledgeService) {}

  @Post()
  create(@Body() dto: KnowledgeDto) {
    return this.knowledegeService.createKnowledge(dto);
  }

  @Get()
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
