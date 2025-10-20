// src/modules/cards/cards.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardEntity } from '../../../database/entities/card.entity';
import { ListEntity } from '../../../database/entities/list.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepository: Repository<CardEntity>,
    @InjectRepository(ListEntity)
    private readonly listRepository: Repository<ListEntity>,
  ) {}

  async findAll(): Promise<CardEntity[]> {
    return this.cardRepository.find({ relations: ['list'] });
  }

  async findOne(id: string): Promise<CardEntity> {
    const card = await this.cardRepository.findOne({ where: { id }, relations: ['list'] });
    if (!card) throw new NotFoundException(`Card with id ${id} not found`);
    return card;
  }

  async create(cardData: Partial<CardEntity>, listId: string): Promise<CardEntity> {
    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) throw new NotFoundException(`List with id ${listId} not found`);

    const card = this.cardRepository.create({ ...cardData, list });
    return this.cardRepository.save(card);
  }

  async update(id: string, cardData: Partial<CardEntity>): Promise<CardEntity> {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: ['list'],
    });

    if (!card) throw new NotFoundException(`Card with id ${id} not found`);

    if ((cardData as any).listId) {
      const newList = await this.listRepository.findOne({
        where: { id: (cardData as any).listId },
      });
      if (!newList)
        throw new NotFoundException(`List with id ${(cardData as any).listId} not found`);
      card.list = newList;
    }

    Object.assign(card, cardData);

    return this.cardRepository.save(card);
  }

  async delete(id: string): Promise<void> {
    const result = await this.cardRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Card with id ${id} not found`);
  }
}
