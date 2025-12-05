// src/modules/cards/cards.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CardEntity } from '../../../database/entities/card.entity';
import { ListEntity } from '../../../database/entities/list.entity';
import { CardService } from './cards.service';
import { CardController } from './cards.controller';
import { AiModule } from '../ai/ai.module';
import { RealtimeModule } from 'src/gateways/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CardEntity, ListEntity]),
    forwardRef(() => AiModule),
    forwardRef(() => RealtimeModule),
  ],
  providers: [CardService],
  controllers: [CardController],
  exports: [CardService],
})
export class CardModule {}
