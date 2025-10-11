// database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ListEntity } from './entities/list.entity';
import { CardEntity } from './entities/card.entity';
import { UsersDBService } from './dbservices/users.dbservice';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity,ListEntity,CardEntity])],
  providers: [UsersDBService],
  exports: [UsersDBService],
})
export class DatabaseModule {}
