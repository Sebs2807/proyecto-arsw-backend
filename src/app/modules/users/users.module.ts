// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../../database/entities/user.entity';
import { UsersDBService } from '../../../database/dbservices/users.dbservice';
import { UsersService } from '../users/users.service';
import { UsersController } from '../users/users.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersDBService, UsersService],
  exports: [UsersDBService, UsersService],
})
export class UsersModule {}
