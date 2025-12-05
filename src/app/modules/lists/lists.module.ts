// src/modules/lists/lists.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListEntity } from '../../../database/entities/list.entity';
import { ListService } from './lists.service';
import { ListController } from './lists.controller';
import { RealtimeGateway } from 'src/gateways/realtime.gateway';
import { DatabaseModule } from 'src/database/database.module';
import { AiModule } from '../ai/ai.module';
import { ElevenLabsModule } from '../eleven-labs/eleven-labs.module';
import { RealtimeModule } from 'src/gateways/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListEntity]),
    DatabaseModule,
    AiModule,
    ElevenLabsModule,
    RealtimeModule,
  ],
  providers: [ListService],
  controllers: [ListController],
  exports: [ListService],
})
export class ListsModule {}
