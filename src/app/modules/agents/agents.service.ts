// src/agents/agents.service.ts

import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { In } from 'typeorm';

import { AgentEntity } from '../../../database/entities/agent.entity';

import { AgentsDBService } from 'src/database/dbservices/agents.dbservice';
import { BoardsDBService } from 'src/database/dbservices/boards.dbservice';
import { ListsDBService } from 'src/database/dbservices/lists.dbservice';
import { WorkspacesDBService } from 'src/database/dbservices/workspaces.dbservice';

import { AgentDto } from './dtos/agent.dto';
import { CreateAgentDto } from './dtos/createAgent.dto';
import { QueryAgentDto } from './dtos/queryAgent.dto';
import { UpdateAgentDto } from './dtos/updateAgent.dto';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    private readonly agentsDbService: AgentsDBService,
    private readonly boardsDbService: BoardsDBService,
    private readonly listsDbService: ListsDBService,
    private readonly workspacesDbService: WorkspacesDBService,
  ) {}

  async createAgent(body: CreateAgentDto): Promise<AgentEntity> {
    const { name, temperature, maxTokens, flowConfig, boardIds, listIds, workspaceId } = body;

    this.logger.log('Creating agent: ' + JSON.stringify(body));

    const workspace = await this.workspacesDbService.repository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID "${workspaceId}" not found.`);
    }

    const boards = boardIds?.length
      ? await this.boardsDbService.repository.findBy({ id: In(boardIds) })
      : [];

    if (boardIds?.length && boards.length !== boardIds.length) {
      this.logger.warn('Some board IDs were not found during agent creation.');
    }

    const lists = listIds?.length
      ? await this.listsDbService.repository.findBy({ id: In(listIds) })
      : [];

    if (listIds?.length && lists.length !== listIds.length) {
      this.logger.warn('Some list IDs were not found during agent creation.');
    }

    const agent = this.agentsDbService.repository.create({
      name,
      temperature,
      maxTokens,
      flowConfig,
      boards,
      lists,
      workspace,
    });

    return this.agentsDbService.repository.save(agent);
  }

  async findAll(queryAgent: QueryAgentDto) {
    try {
      const { search, boardId, page, limit, workspaceId } = queryAgent;

      if (!workspaceId) {
        throw new NotFoundException('workspaceId is required to fetch agents.');
      }

      const skip = (page - 1) * limit;

      const query = this.agentsDbService.repository
        .createQueryBuilder('agent')
        .leftJoinAndSelect('agent.boards', 'boards')
        .leftJoinAndSelect('agent.lists', 'lists')
        .where('agent.workspaceId = :workspaceId', { workspaceId })
        .orderBy('agent.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      if (boardId) {
        query.andWhere('boards.id = :boardId', { boardId });
      }

      if (search) {
        query.andWhere('LOWER(agent.name) LIKE LOWER(:search)', { search: `%${search}%` });
      }

      const [agents, total] = await query.getManyAndCount();

      const agentsDTO = plainToInstance(AgentDto, agents, {
        excludeExtraneousValues: true,
      });

      return {
        items: agentsDTO,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error fetching agents: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch agents.');
    }
  }

  async findOne(id: string): Promise<AgentEntity> {
    const agent = await this.agentsDbService.repository.findOne({
      where: { id },
      relations: ['boards', 'lists', 'workspace'],
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID "${id}" not found.`);
    }

    return agent;
  }

  async updateAgent(id: string, updateData: UpdateAgentDto) {
    try {
      const agent = await this.agentsDbService.repository.findOne({
        where: { id },
        relations: ['boards', 'lists'],
      });

      if (!agent) {
        throw new NotFoundException(`Agent with ID "${id}" not found.`);
      }

      // 1. Aplicar actualizaciones de propiedades directas
      this.applyDirectUpdates(agent, updateData);

      // 2. Aplicar actualización de Workspace (Validación y Asignación)
      if (updateData.workspaceId !== undefined) {
        agent.workspace = await this.validateAndGetWorkspace(updateData.workspaceId);
      }

      // 3. Aplicar actualizaciones de relaciones
      await this.updateRelatedEntities(agent, updateData);

      return await this.agentsDbService.repository.save(agent);
    } catch (error) {
      // Manejo de errores centralizado
      this.logger.error('Error updating agent:', error);

      // Si ya es una NotFoundException, relanzarla.
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update agent.');
    }
  }

  async deleteAgent(id: string) {
    const result = await this.agentsDbService.repository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Agent with ID "${id}" not found.`);
    }

    return { deleted: true };
  }

  private applyDirectUpdates(agent: AgentEntity, updateData: UpdateAgentDto): void {
    if (updateData.name !== undefined) agent.name = updateData.name;
    if (updateData.temperature !== undefined) agent.temperature = updateData.temperature;
    if (updateData.maxTokens !== undefined) agent.maxTokens = updateData.maxTokens;
    if (updateData.flowConfig !== undefined) agent.flowConfig = updateData.flowConfig;
  }

  /**
   * Fetches and validates the new Workspace entity.
   */
  private async validateAndGetWorkspace(workspaceId: string): Promise<any> {
    const workspace = await this.workspacesDbService.repository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID "${workspaceId}" not found.`);
    }
    return workspace;
  }

  /**
   * Updates board and list relations if their respective IDs are provided in the DTO.
   */
  private async updateRelatedEntities(
    agent: AgentEntity,
    updateData: UpdateAgentDto,
  ): Promise<void> {
    if (updateData.boardIds !== undefined) {
      agent.boards =
        updateData.boardIds.length > 0
          ? await this.boardsDbService.repository.findBy({ id: In(updateData.boardIds) })
          : [];
    }

    if (updateData.listIds !== undefined) {
      agent.lists =
        updateData.listIds.length > 0
          ? await this.listsDbService.repository.findBy({ id: In(updateData.listIds) })
          : [];
    }
  }
}
