import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardEntity } from '../../../database/entities/card.entity';
import { ListEntity } from '../../../database/entities/list.entity';
import { RealtimeGateway } from 'src/gateways/realtime.gateway';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepository: Repository<CardEntity>,
    @InjectRepository(ListEntity)
    private readonly listRepository: Repository<ListEntity>,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async findAll(): Promise<CardEntity[]> {
    return this.cardRepository.find({
      relations: ['list', 'list.board'],
    });
  }

  async findOne(id: string): Promise<CardEntity> {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: ['list', 'list.board'],
    });

    if (!card) throw new NotFoundException(`Card with id ${id} not found`);
    return card;
  }

  async create(cardData: Partial<CardEntity>, listId: string): Promise<CardEntity> {
    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['board'],
    });

    if (!list) throw new NotFoundException(`List with id ${listId} not found`);

    const card = this.cardRepository.create({ ...cardData, list });
    const saved = await this.cardRepository.save(card);

    if (list.board?.id) {
      this.realtimeGateway.emitToBoard(list.board.id, 'card:created', {
        listId,
        card: saved,
      });
    }

    return saved;
  }

  async update(id: string, cardData: Partial<CardEntity>): Promise<CardEntity> {
    const card = await this.findOne(id);

    if ((cardData as any).listId) {
      const newList = await this.listRepository.findOne({
        where: { id: (cardData as any).listId },
        relations: ['board'],
      });

      if (!newList)
        throw new NotFoundException(`List with id ${(cardData as any).listId} not found`);

      card.list = newList;
    }

    Object.assign(card, cardData);
    const updated = await this.cardRepository.save(card);

    const boardId = card.list?.board?.id;
    if (boardId) {
      this.realtimeGateway.emitToBoard(boardId, 'card:moved', {
        sourceListId: (cardData as any).sourceListId ?? card.list.id,
        destListId: card.list.id,
        card: updated,
      });
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const card = await this.findOne(id);
    await this.cardRepository.delete(id);

    const boardId = card.list?.board?.id;
    if (boardId) {
      this.realtimeGateway.emitToBoard(boardId, 'card:deleted', {
        listId: card.list.id,
        cardId: id,
      });
    }
  }
}
