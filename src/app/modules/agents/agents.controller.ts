// src/agents/agents.controller.ts

import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dtos/createAgent.dto';
import { QueryAgentDto } from './dtos/queryAgent.dto';
import { UpdateAgentDto } from './dtos/updateAgent.dto';

@Controller({ path: 'agents', version: '1' })
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  async create(@Body() body: CreateAgentDto) {
    return this.agentsService.createAgent(body);
  }

  @Get('paginated')
  async findPaginated(@Query() queryAgentDto: QueryAgentDto) {
    return this.agentsService.findAll(queryAgentDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.agentsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateAgentDto) {
    const updated = await this.agentsService.updateAgent(id, body);
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.agentsService.deleteAgent(id);
  }
}
