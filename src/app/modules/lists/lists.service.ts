import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { BoardsDBService } from 'src/database/dbservices/boards.dbservice';
import { CreateListDto } from './dtos/createList.dto';
import { UpdateListDto } from './dtos/updateList.dto';
import { ListDto } from './dtos/list.dto';
import { ListsDBService } from 'src/database/dbservices/lists.dbservice';
import { RealtimeGateway } from 'src/gateways/realtime.gateway';

@Injectable()
export class ListService {
  private readonly logger = new Logger(ListService.name);

  constructor(
    private readonly listDbService: ListsDBService,
    private readonly boardsDbService: BoardsDBService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async findAllByBoard(boardId: string): Promise<ListDto[]> {
    try {
      const board = await this.boardsDbService.repository.findOne({ where: { id: boardId } });
      if (!board) throw new NotFoundException(`Board with ID ${boardId} not found`);

      const lists = await this.listDbService.repository.find({
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
      const list = await this.listDbService.repository.findOne({
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

  // --- CREAR LISTA ---
  async create(createListDto: CreateListDto): Promise<ListDto> {
    try {
      const board = await this.boardsDbService.repository.findOne({
        where: { id: createListDto.boardId },
      });

      if (!board) throw new NotFoundException(`Board with ID ${createListDto.boardId} not found`);

      const list = this.listDbService.repository.create({
        title: createListDto.title,
        description: createListDto.description,
        order: createListDto.order,
        board,
      });

      const savedList = await this.listDbService.repository.save(list);
      const listDto = plainToInstance(ListDto, savedList, { excludeExtraneousValues: true });

      this.realtimeGateway.emitGlobalUpdate('list:created', {
        ...listDto,
        board: { id: board.id },
      });

      return listDto;
    } catch (error) {
      this.logger.error(`Error creating list: ${error.message}`);
      throw new InternalServerErrorException('Failed to create list');
    }
  }

  // --- ACTUALIZAR LISTA ---
  async update(id: string, updateListDto: UpdateListDto): Promise<ListDto> {
    try {
      const list = await this.listDbService.repository.findOne({ where: { id } });

      if (!list) throw new NotFoundException(`List with ID ${id} not found`);

      Object.assign(list, updateListDto);

      const updatedList = await this.listDbService.repository.save(list);
      const listDto = plainToInstance(ListDto, updatedList, { excludeExtraneousValues: true });

      this.realtimeGateway.emitGlobalUpdate('list:updated', listDto);

      return listDto;
    } catch (error) {
      this.logger.error(`Error updating list ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to update list');
    }
  }

  // --- ELIMINAR LISTA ---
  async delete(id: string): Promise<void> {
    try {
      const result = await this.listDbService.repository.delete(id);
      if (result.affected === 0) throw new NotFoundException(`List with ID ${id} not found`);

      this.realtimeGateway.emitGlobalUpdate('list:deleted', { id });
    } catch (error) {
      this.logger.error(`Error deleting list ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete list');
    }
  }
}
