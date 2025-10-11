// src/modules/lists/lists.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListEntity } from '../../../database/entities/list.entity';
import { CardEntity } from '../../../database/entities/card.entity'; 
import { ListService } from './lists.service';
import { ListController } from './lists.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ListEntity, CardEntity])],
  providers: [ListService],
  controllers: [ListController],
  exports: [ListService],
})
export class ListsModule {}
