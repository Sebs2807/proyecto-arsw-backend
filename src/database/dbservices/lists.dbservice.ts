import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListEntity } from '../entities/list.entity';
import { BoardEntity } from '../entities/board.entity';

@Injectable()
export class ListsDBService {
  private readonly logger = new Logger(ListsDBService.name);
  readonly repository: Repository<ListEntity>;

  constructor(
    @InjectRepository(ListEntity)
    private readonly listsRepository: Repository<ListEntity>,
  ) {
    this.repository = listsRepository;
  }

  async findByBoard(boardId: string): Promise<ListEntity[]> {
    const lists = await this.repository.find({
      where: { board: { id: boardId } },
      relations: ['cards', 'board'],
      order: { order: 'ASC' },
    });

    if (!lists.length) {
      this.logger.warn(`No se encontraron listas para el tablero con ID ${boardId}`);
    }

    return lists;
  }

  async findOne(id: string): Promise<ListEntity> {
    const list = await this.repository.findOne({
      where: { id },
      relations: ['cards', 'board'],
    });

    if (!list) {
      this.logger.warn(`Lista con ID ${id} no encontrada`);
      throw new NotFoundException('List not found');
    }

    return list;
  }

  async create(data: Partial<ListEntity>): Promise<ListEntity> {
    const newList = this.repository.create(data);
    const savedList = await this.repository.save(newList);
    this.logger.log(`Lista creada con ID ${savedList.id}`);
    return savedList;
  }

  async update(id: string, data: Partial<ListEntity>): Promise<ListEntity> {
    const list = await this.findOne(id);
    Object.assign(list, data);
    const updatedList = await this.repository.save(list);
    this.logger.log(`Lista actualizada con ID ${updatedList.id}`);
    return updatedList;
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`Intento de eliminar una lista inexistente con ID ${id}`);
      throw new NotFoundException('List not found');
    }
    this.logger.log(`Lista eliminada con ID ${id}`);
  }
}
