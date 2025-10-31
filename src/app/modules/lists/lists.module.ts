// src/modules/lists/lists.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListEntity } from '../../../database/entities/list.entity';
import { CardEntity } from '../../../database/entities/card.entity';
import { ListService } from './lists.service';
import { ListController } from './lists.controller';
import { RealtimeGateway } from 'src/gateways/realtime.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([ListEntity])],
  providers: [ListService, RealtimeGateway],
  controllers: [ListController],
  exports: [ListService],
})
export class ListsModule {}
