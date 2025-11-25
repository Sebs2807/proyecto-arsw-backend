// src/agents/agents.service.ts

import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AgentEntity } from '../../../database/entities/agent.entity';
// Asumimos que existen los DB Services

import { BoardsDBService } from 'src/database/dbservices/boards.dbservice';

import { AgentDto } from './dtos/agent.dto'; // Asumimos la existencia
import { plainToInstance } from 'class-transformer';
import { In } from 'typeorm';
import { CreateAgentDto } from './dtos/createAgent.dto';
import { QueryAgentDto } from './dtos/queryAgent.dto';
import { UpdateAgentDto } from './dtos/updateAgent.dto';
import { AgentsDBService } from 'src/database/dbservices/agents.dbservice';
import { ListsDBService } from 'src/database/dbservices/lists.dbservice';
import { BoardEntity } from 'src/database/entities/board.entity';
import { ListEntity } from 'src/database/entities/list.entity';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    private readonly agentsDbService: AgentsDBService,
    private readonly boardsDbService: BoardsDBService,
    private readonly listsDbService: ListsDBService, // Necesario para asociar Boards
  ) {}

  async createAgent(body: CreateAgentDto): Promise<AgentEntity> {
    const { name, temperature, maxTokens, flowConfig, boardIds, listIds } = body;

    this.logger.log('Creating agent with data: ' + JSON.stringify(body));

    let boards: BoardEntity[] = [];
    if (boardIds?.length) {
      boards = await this.boardsDbService.repository.findBy({
        id: In(boardIds),
      });

      if (boards.length !== boardIds.length) {
        this.logger.warn('Some board IDs were not found during agent creation.');
      }
    }

    let lists: ListEntity[] = [];
    if (listIds?.length) {
      lists = await this.listsDbService.repository.findBy({
        id: In(listIds),
      });

      if (lists.length !== listIds.length) {
        this.logger.warn('Some list IDs were not found during agent creation.');
      }
    }

    const agent = this.agentsDbService.repository.create({
      name,
      temperature,
      maxTokens,
      flowConfig,
      boards,
      lists,
    });

    return this.agentsDbService.repository.save(agent);
  }

  async findAll(queryAgent: QueryAgentDto) {
    try {
      const { search, boardId, page, limit } = queryAgent;
      const skip = (page - 1) * limit;

      const query = this.agentsDbService.repository
        .createQueryBuilder('agent')
        .leftJoinAndSelect('agent.boards', 'boards')
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

      console.log(agents);

      const agentsDTO = plainToInstance(AgentDto, agents, { excludeExtraneousValues: true });

      this.logger.log(`Fetched ${agents.length} agents (page ${page}/${Math.ceil(total / limit)})`);

      return {
        items: agentsDTO,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error fetching agents: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch agents due to a server error.');
    }
  }

  async findOne(id: string): Promise<AgentEntity> {
    const agent = await this.agentsDbService.repository.findOne({
      where: { id },
      relations: ['boards', 'lists'],
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID "${id}" not found.`);
    }
    return agent;
  }

  async updateAgent(id: string, updateData: UpdateAgentDto) {
    try {
      if (updateData.boardIds !== undefined) {
        const agent = await this.agentsDbService.repository.findOne({
          where: { id },
          relations: ['boards'],
        });

        if (!agent) throw new NotFoundException(`Agent with ID "${id}" not found`);

        // Actualizar propiedades simples
        if (updateData.name !== undefined) agent.name = updateData.name;
        if (updateData.temperature !== undefined) agent.temperature = updateData.temperature;
        if (updateData.maxTokens !== undefined) agent.maxTokens = updateData.maxTokens;
        if (updateData.flowConfig !== undefined) agent.flowConfig = updateData.flowConfig;

        // Cargar y actualizar la relación boards
        const boards =
          updateData.boardIds.length > 0
            ? await this.boardsDbService.repository.findBy({ id: In(updateData.boardIds) })
            : [];

        agent.boards = boards;
        await this.agentsDbService.repository.save(agent);
        return agent;
      }

      // 2. Para actualizaciones simples (sin boardIds)
      const { boardIds, ...partial } = updateData as any;
      await this.agentsDbService.repository.update(id, partial);
      const updated = await this.agentsDbService.repository.findOne({ where: { id } });

      if (!updated) throw new NotFoundException(`Agent with ID "${id}" not found after update`);

      return updated;
    } catch (error) {
      this.logger.error('Error updating agent:', error);
      // Re-lanzar NotFoundException si ya ocurrió, si no, lanzar error interno
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update agent');
    }
  }

  // --- ELIMINAR AGENTE ---
  async deleteAgent(id: string) {
    // La eliminación de un agente debería manejar las cascadas definidas en la entidad
    const result = await this.agentsDbService.repository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Agent with ID "${id}" not found.`);
    }
    return { deleted: true };
  }
}
