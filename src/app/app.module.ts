import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

import { AuthModule } from '../app/modules/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { UserEntity } from 'src/database/entities/user.entity';
import { BoardEntity } from 'src/database/entities/board.entity';
import { ListEntity } from 'src/database/entities/list.entity';
import { CardEntity } from 'src/database/entities/card.entity';
import { UsersModule } from './modules/users/users.module';
import { BoardsModule } from './modules/boards/boards.module';
import { ListsModule } from './modules/lists/lists.module';
import { CardModule } from './modules/cards/cards.module';
import { UserWorkspaceEntity } from 'src/database/entities/userworkspace.entity';
import { WorkspaceEntity } from 'src/database/entities/workspace.entity';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { UsersWorkspacesModule } from './modules/users-workspaces/usersworkspaces.module';
import { RealtimeGateway } from 'src/gateways/realtime.gateway';
import { LivekitModule } from 'src/livekit/livekit.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { AgentEntity } from 'src/database/entities/agent.entity';
import { AgentsModule } from './modules/agents/agents.module';
import { KnowledgeModule } from './modules/knowledges/knowledges.modules';

@Module({
  imports: [
    LivekitModule,
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
        port: Number.parseInt(config.get('DB_PORT', '3306')),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [
          UserEntity,
          UserWorkspaceEntity,
          WorkspaceEntity,
          BoardEntity,
          ListEntity,
          CardEntity,
          AgentEntity,
        ],
        synchronize: true,
        logging: false,
        ssl:
          config.get('DB_SSL') === 'true'
            ? {
                ca: readFileSync(join(__dirname, '..', '..', 'certs', 'ca.pem')),
                rejectUnauthorized: true,
              }
            : undefined,
      }),
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BoardsModule,
    ListsModule,
    CardModule,
    WorkspacesModule,
    UsersWorkspacesModule,
    CalendarModule,
    AgentsModule,
    KnowledgeModule,
  ],
  providers: [RealtimeGateway],
})
export class AppModule {}
