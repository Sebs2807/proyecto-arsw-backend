// database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ListEntity } from './entities/list.entity';
import { CardEntity } from './entities/card.entity';
import { UsersDBService } from './dbservices/users.dbservice';
import { UserWorkspaceEntity } from './entities/userworkspace.entity';
import { WorkspaceEntity } from './entities/workspace.entity';
import { WorkspaceDBService } from './dbservices/workspace.dbservice';
import { UsersWorkspacesDBService } from './dbservices/usersworkspaces.dbservice';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ListEntity,
      CardEntity,
      UserWorkspaceEntity,
      WorkspaceEntity,
    ]),
  ],
  providers: [UsersDBService, WorkspaceDBService, UsersWorkspacesDBService],
  exports: [UsersDBService, WorkspaceDBService, UsersWorkspacesDBService],
})
export class DatabaseModule {}
