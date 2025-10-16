// src/modules/users-workspaces/usersworkspaces.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserWorkspaceEntity } from 'src/database/entities/userworkspace.entity';
import { DatabaseModule } from 'src/database/database.module';
import { UsersWorkspacesService } from './usersworkspaces.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserWorkspaceEntity]), DatabaseModule],
  providers: [UsersWorkspacesService],
  exports: [UsersWorkspacesService],
})
export class UsersWorkspacesModule {}
