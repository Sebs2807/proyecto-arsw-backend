import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceEntity } from 'src/database/entities/workspace.entity';
import { DatabaseModule } from 'src/database/database.module';
import { WorkspacesController } from './workspaces.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceEntity]), DatabaseModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
