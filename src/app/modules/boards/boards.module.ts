import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardEntity } from '../../../database/entities/board.entity';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { DatabaseModule } from 'src/database/database.module';
import { RealtimeModule } from '../../../gateways/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([BoardEntity]), DatabaseModule, RealtimeModule],
  providers: [BoardsService],
  controllers: [BoardsController],
  exports: [BoardsService],
})
export class BoardsModule {}
