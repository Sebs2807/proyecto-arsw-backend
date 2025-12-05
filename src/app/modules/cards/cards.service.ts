import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardEntity } from '../../../database/entities/card.entity';
import { ListEntity } from '../../../database/entities/list.entity';
import { CreateCardDto } from './dtos/createCard.dto';
import { UpdateCardDto } from './dtos/updateCard.dto';
import { RealtimeGateway } from 'src/gateways/realtime.gateway';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepository: Repository<CardEntity>,
    @InjectRepository(ListEntity)
    private readonly listRepository: Repository<ListEntity>,
    @Inject(forwardRef(() => RealtimeGateway))
    public readonly realtimeGateway: RealtimeGateway,
  ) {}

  async updateConversationState(id: string, conversationState: any): Promise<CardEntity> {
    const card = await this.findOne(id);
    card.conversationState = conversationState;
    return await this.cardRepository.save(card);
  }

  async findAll(): Promise<CardEntity[]> {
    return this.cardRepository.find({
      relations: ['list'],
    });
  }

  async findOne(id: string): Promise<CardEntity> {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: ['list'],
    });

    if (!card) throw new NotFoundException(`Card with id ${id} not found`);
    return card;
  }

  async findCardWithFullContext(id: string): Promise<CardEntity> {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: ['list', 'list.agent'],
    });

    if (!card) throw new NotFoundException(`Card with id ${id} not found`);
    return card;
  }

  async create(dto: CreateCardDto): Promise<CardEntity> {
    const { listId, ...data } = dto;

    const list = await this.listRepository.findOne({
      where: { id: listId },
    });

    if (!list) throw new NotFoundException(`List with id ${listId} not found`);

    const card = this.cardRepository.create({
      ...data,
      list,
    });

    const saved = await this.cardRepository.save(card);

    this.realtimeGateway.emitGlobalUpdate('card:created', {
      listId,
      card: saved,
    });

    return saved;
  }

  async update(id: string, dto: UpdateCardDto): Promise<CardEntity> {
    console.log('UpdateCardDto received:', dto);
    const card = await this.findOne(id);

    const { listId, ...updateData } = dto;
    let sourceListId = card.list.id;
    let destListId = sourceListId;

    if (listId) {
      const newList = await this.listRepository.findOne({
        where: { id: listId },
      });

      if (!newList) throw new NotFoundException(`List with id ${listId} not found`);

      card.list = newList;
      destListId = newList.id;
    }

    Object.assign(card, updateData);

    const updated = await this.cardRepository.save(card);
    const fullCard = await this.findOne(updated.id);

    this.realtimeGateway.emitGlobalUpdate('card:moved', {
      sourceListId,
      destListId,
      card: fullCard,
    });

    return fullCard;
  }

  async delete(id: string): Promise<void> {
    const card = await this.findOne(id);

    await this.cardRepository.delete(id);

    this.realtimeGateway.emitGlobalUpdate('card:deleted', {
      listId: card.list.id,
      cardId: id,
    });
  }
}
