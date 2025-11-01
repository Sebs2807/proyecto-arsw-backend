import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListEntity } from '../../../database/entities/list.entity';
import { RealtimeGateway } from 'src/gateways/realtime.gateway';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(ListEntity)
    private readonly listRepository: Repository<ListEntity>,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async findOne(id: string): Promise<ListEntity | null> {
    return this.listRepository.findOne({ where: { id }, relations: ['cards'] });
  }

  async findAll(): Promise<ListEntity[]> {
    return this.listRepository.find({ relations: ['cards'] });
  }

  async create(listData: Partial<ListEntity>): Promise<ListEntity> {
    const list = this.listRepository.create(listData);
    const saved = await this.listRepository.save(list);

    this.realtimeGateway.emitGlobalUpdate('list:created', saved);

    return saved;
  }

  async update(id: string, listData: Partial<ListEntity>): Promise<ListEntity | null> {
    await this.listRepository.update(id, listData);
    const updated = await this.findOne(id);

    if (updated) {
      this.realtimeGateway.emitGlobalUpdate('list:updated', updated);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const list = await this.findOne(id);
    if (!list) return;

    await this.listRepository.delete(id);

    this.realtimeGateway.emitGlobalUpdate('list:deleted', { id });
  }
}
