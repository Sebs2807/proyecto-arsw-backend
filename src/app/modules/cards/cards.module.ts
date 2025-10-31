// src/modules/cards/cards.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CardEntity } from '../../../database/entities/card.entity';
import { ListEntity } from '../../../database/entities/list.entity'; 
import { CardService } from './cards.service';
import { CardController } from './cards.controller';
import { RealtimeGateway } from 'src/gateways/realtime.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([CardEntity, ListEntity]), 
  ],
  providers: [CardService, RealtimeGateway],
  controllers: [CardController],
  exports: [CardService],
})
export class CardModule {}
