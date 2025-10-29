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
import { BoardsDBService } from './dbservices/boards.dbservice';
import { BoardEntity } from './entities/board.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ListEntity,
      CardEntity,
      UserWorkspaceEntity,
      WorkspaceEntity,
      BoardEntity,
    ]),
  ],
  providers: [UsersDBService, WorkspaceDBService, UsersWorkspacesDBService, BoardsDBService],
  exports: [UsersDBService, WorkspaceDBService, UsersWorkspacesDBService, BoardsDBService],
})
export class DatabaseModule {}
