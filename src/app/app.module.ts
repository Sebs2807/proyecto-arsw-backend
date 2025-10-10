import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../app/modules/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { UserEntity } from 'src/database/entities/user.entity';
import { BoardEntity } from 'src/database/entities/board.entity';
import { UsersModule } from './modules/users/users.module';
import { BoardsModule } from './modules/boards/boards.module';
import { join } from 'path';
import { readFileSync } from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT', '3306')),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [UserEntity, BoardEntity],
        synchronize: true,
        logging: false,
        ssl: config.get('DB_SSL') === 'true' ? {
          ca: readFileSync(join(__dirname, '..', '..', 'certs', 'ca.pem')),
          rejectUnauthorized: true,
        } : undefined,
      }),
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BoardsModule,
  ],
})
export class AppModule {}
