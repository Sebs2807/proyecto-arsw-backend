// src/modules/cards/cards.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CardEntity } from '../../../database/entities/card.entity';
import { ListEntity } from '../../../database/entities/list.entity'; 
import { CardService } from './cards.service';
import { CardController } from './cards.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CardEntity, ListEntity]), 
  ],
  providers: [CardService],
  controllers: [CardController],
  exports: [CardService],
})
export class CardModule {}
