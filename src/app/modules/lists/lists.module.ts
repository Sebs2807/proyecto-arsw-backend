// src/modules/lists/lists.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListEntity } from '../../../database/entities/list.entity';
import { ListService } from './lists.service';
import { ListController } from './lists.controller';
import { RealtimeGateway } from 'src/gateways/realtime.gateway';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [TypeOrmModule.forFeature([ListEntity]), DatabaseModule],
  providers: [ListService, RealtimeGateway],
  controllers: [ListController],
  exports: [ListService],
})
export class ListsModule {}
