// src/modules/cards/cards.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CardService } from './cards.service';
import { CardEntity } from '../../../database/entities/card.entity';

@Controller({ path: 'cards', version: '1' })
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  findAll(): Promise<CardEntity[]> {
    return this.cardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CardEntity> {
    return this.cardService.findOne(id);
  }

  @Post()
  create(
    @Body('cardData') cardData: Partial<CardEntity>,
    @Body('listId') listId: string,
  ): Promise<CardEntity> {
    return this.cardService.create(cardData, listId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() cardData: Partial<CardEntity>): Promise<CardEntity> {
    return this.cardService.update(id, cardData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.cardService.delete(id);
  }
}
