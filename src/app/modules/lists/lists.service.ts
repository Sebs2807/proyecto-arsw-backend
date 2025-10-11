// src/modules/lists/lists.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListEntity } from '../../../database/entities/list.entity';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(ListEntity)
    private readonly listRepository: Repository<ListEntity>
  ) {}

 
  async findOne(id: string): Promise<ListEntity | null>  {
    return this.listRepository.findOne({ where: { id }, relations: ['cards'] });
  }
  async create(listData: Partial<ListEntity>): Promise<ListEntity> {
    const list = this.listRepository.create(listData);
    return this.listRepository.save(list);
  }

  async update(id: string, listData: Partial<ListEntity>): Promise<ListEntity | null> {
    await this.listRepository.update(id, listData);
    return this.findOne(id);
  }


  async delete(id: string): Promise<void> {
    await this.listRepository.delete(id);
  }
}
