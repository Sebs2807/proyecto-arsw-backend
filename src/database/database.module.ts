// database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersDBService } from './dbservices/users.dbservice';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersDBService],
  exports: [UsersDBService],
})
export class DatabaseModule {}
