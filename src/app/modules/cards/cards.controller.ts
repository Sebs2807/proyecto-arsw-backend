// src/modules/cards/cards.controller.ts

import { Controller, Get, Post, Body, Param, Delete, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CardService } from './cards.service';
import { CardDto } from './dtos/card.dto';
import { CreateCardDto } from './dtos/createCard.dto';
import { UpdateCardDto } from './dtos/updateCard.dto';

@ApiTags('Cards')
@Controller({ path: 'cards', version: '1' })
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tarjetas' })
  @ApiResponse({ status: 200, type: [CardDto] })
  findAll(): Promise<CardDto[]> {
    return this.cardService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarjeta por ID' })
  @ApiResponse({ status: 200, type: CardDto })
  @ApiResponse({ status: 404, description: 'Card not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CardDto> {
    return this.cardService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva tarjeta' })
  @ApiResponse({ status: 201, type: CardDto })
  create(@Body() dto: CreateCardDto): Promise<CardDto> {
    return this.cardService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente una tarjeta' })
  @ApiResponse({ status: 200, type: CardDto })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCardDto): Promise<CardDto> {
    return this.cardService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una tarjeta por ID' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Card not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.cardService.delete(id);
  }
}
