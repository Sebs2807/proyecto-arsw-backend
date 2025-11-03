import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  Inject,
  Optional,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { BoardsDBService } from 'src/database/dbservices/boards.dbservice';
import { CreateListDto } from './dtos/createList.dto';
import { UpdateListDto } from './dtos/updateList.dto';
import { ListDto } from './dtos/list.dto';
import { ListsDBService } from 'src/database/dbservices/lists.dbservice';
import { RealtimeGateway } from 'src/gateways/realtime.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListEntity } from 'src/database/entities/list.entity';

@Injectable()
export class ListService {
  private readonly logger = new Logger(ListService.name);

  constructor(
    @Optional() private readonly listDbService: ListsDBService,
    @Optional() private readonly boardsDbService: BoardsDBService,
    @Optional()
    @Inject(getRepositoryToken(ListEntity))
    private readonly listRepository?: Repository<ListEntity>,
    private readonly realtimeGateway?: RealtimeGateway,
  ) {}

  async findAllByBoard(boardId: string): Promise<ListDto[]> {
    try {
      const boardsRepo = this.boardsDbService?.repository;
      const board = boardsRepo ? await boardsRepo.findOne({ where: { id: boardId } }) : null;
      if (!board) throw new NotFoundException(`Board with ID ${boardId} not found`);

      const repo = this.listRepository ?? this.listDbService.repository;
      const lists = await repo.find({
        where: { board: { id: boardId } },
        relations: ['cards'],
        order: { createdAt: 'ASC' },
      });

      return plainToInstance(ListDto, lists, { excludeExtraneousValues: true });
    } catch (error) {
      this.logger.error(`Error fetching lists for board ${boardId}: ${error.message}`);
      throw new ForbiddenException('Failed to fetch lists');
    }
  }

  async findOne(id: string): Promise<ListDto> {
    try {
      const repo = this.listRepository ?? this.listDbService.repository;
      const list = await repo.findOne({
        where: { id },
        relations: ['board', 'cards'],
      });

      if (!list) throw new NotFoundException(`List with ID ${id} not found`);

      return plainToInstance(ListDto, list, { excludeExtraneousValues: true });
    } catch (error) {
      this.logger.error(`Error fetching list ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch list');
    }
  }

  async create(createListDto: CreateListDto): Promise<ListDto> {
    try {
      const boardsRepo = this.boardsDbService?.repository;
      const board = boardsRepo
        ? await boardsRepo.findOne({ where: { id: createListDto.boardId } })
        : null;

      if (!board) throw new NotFoundException(`Board with ID ${createListDto.boardId} not found`);

      const repo = this.listRepository ?? this.listDbService.repository;
      const list = repo.create({
        title: createListDto.title,
        description: createListDto.description,
        order: createListDto.order,
        board,
      });

      const savedList = await repo.save(list);
      const listDto = plainToInstance(ListDto, savedList, { excludeExtraneousValues: true });

      // prefer emitGlobalUpdate when available (tests mock this)
      this.realtimeGateway?.emitGlobalUpdate('list:created', {
        ...listDto,
        board: { id: board.id },
      });

      return listDto;
    } catch (error) {
      this.logger.error(`Error creating list: ${error.message}`);
      throw new InternalServerErrorException('Failed to create list');
    }
  }

  async update(id: string, updateListDto: UpdateListDto): Promise<ListDto> {
    try {
      const repo = this.listRepository ?? this.listDbService.repository;
      const list = await repo.findOne({ where: { id } });

      if (!list) throw new NotFoundException(`List with ID ${id} not found`);

      Object.assign(list, updateListDto);

      const updatedList = await repo.save(list);
      const listDto = plainToInstance(ListDto, updatedList, { excludeExtraneousValues: true });

      this.realtimeGateway?.emitGlobalUpdate('list:updated', listDto);

      return listDto;
    } catch (error) {
      this.logger.error(`Error updating list ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to update list');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const repo = this.listRepository ?? this.listDbService.repository;
      const list = await repo.findOne({
        where: { id },
        relations: ['board'],
      });

      if (!list) throw new NotFoundException(`List with ID ${id} not found`);

      const result = await repo.delete(id);
      if (result.affected === 0) throw new NotFoundException(`List with ID ${id} not found`);

      this.realtimeGateway?.emitGlobalUpdate('list:deleted', { id });
    } catch (error) {
      this.logger.error(`Error deleting list ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete list');
    }
  }
}
