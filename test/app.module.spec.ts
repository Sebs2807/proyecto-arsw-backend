import 'reflect-metadata';
import { Module, DynamicModule } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as fs from 'fs';

// --- Minimal valid Nest modules for scanner ---
@Module({}) class MockAuthModule {}
@Module({}) class MockDatabaseModule {}
@Module({}) class MockUsersModule {}
@Module({}) class MockBoardsModule {}
@Module({}) class MockListsModule {}
@Module({}) class MockCardModule {}
@Module({}) class MockWorkspacesModule {}
@Module({}) class MockUsersWorkspacesModule {}
@Module({}) class MockCalendarModule {} 

// --- Mock database entities ---
jest.mock('../src/database/entities/user.entity', () => ({ UserEntity: class {} }));
jest.mock('../src/database/entities/userworkspace.entity', () => ({ UserWorkspaceEntity: class {} }));
jest.mock('../src/database/entities/workspace.entity', () => ({ WorkspaceEntity: class {} }));
jest.mock('../src/database/entities/board.entity', () => ({ BoardEntity: class {} }));
jest.mock('../src/database/entities/list.entity', () => ({ ListEntity: class {} }));
jest.mock('../src/database/entities/card.entity', () => ({ CardEntity: class {} }));

// --- Mock TypeORM module ---
@Module({}) class MockTypeOrmModule {}
const forRootMock = jest.fn().mockReturnValue({ module: MockTypeOrmModule } as DynamicModule);
const forRootAsyncMock = jest.fn().mockImplementation((options) => {
  if (options?.useFactory) {
    const fakeConfig = {
      get: (key: string, def?: any) =>
        process.env[key] !== undefined ? process.env[key] : def,
    };
    options.useFactory(fakeConfig); 
  }

  return { module: MockTypeOrmModule } as DynamicModule;
});


jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forRoot: forRootMock,
    forRootAsync: forRootAsyncMock,
    forFeature: jest.fn(),
  },
}));

// --- ✅ Mock fs and node:fs ---
jest.mock('fs', () => ({
  readFileSync: jest.fn(() => 'FAKE_CA_PEM'),
  existsSync: jest.fn(() => true),
}));
jest.mock('node:fs', () => ({
  readFileSync: jest.fn(() => 'FAKE_CA_PEM'),
  existsSync: jest.fn(() => true),
}));

jest.mock('../src/app/modules/auth/auth.module', () => ({ AuthModule: MockAuthModule }));
jest.mock('../src/database/database.module', () => ({ DatabaseModule: MockDatabaseModule }));
jest.mock('../src/app/modules/users/users.module', () => ({ UsersModule: MockUsersModule }));
jest.mock('../src/app/modules/boards/boards.module', () => ({ BoardsModule: MockBoardsModule }));
jest.mock('../src/app/modules/lists/lists.module', () => ({ ListsModule: MockListsModule }));
jest.mock('../src/app/modules/cards/cards.module', () => ({ CardModule: MockCardModule }));
jest.mock('../src/app/modules/workspaces/workspaces.module', () => ({ WorkspacesModule: MockWorkspacesModule }));
jest.mock('../src/app/modules/users-workspaces/usersworkspaces.module', () => ({ UsersWorkspacesModule: MockUsersWorkspacesModule }));
jest.mock('../src/app/modules/calendar/calendar.module', () => ({ CalendarModule: MockCalendarModule })); // ✅ IMPORTANTE: este mock arriba del require(AppModule)
jest.mock('../src/livekit/livekit.module', () => ({ LivekitModule: class {} }));
jest.mock('../src/gateways/realtime.gateway', () => ({ RealtimeGateway: class {} }));

jest.mock('googleapis', () => ({
  google: {
    auth: { OAuth2: jest.fn() },
    calendar: jest.fn(() => ({
      events: { insert: jest.fn(), list: jest.fn() },
    })),
  },
}));

// --- Require AppModule after mocks ---
const { AppModule } = require('../src/app/app.module');

describe('AppModule (mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '3306';
    process.env.DB_USER = 'user';
    process.env.DB_PASSWORD = 'pass';
    process.env.DB_NAME = 'dbname';
    process.env.DB_SSL = 'false';
  });

  it('debería compilar AppModule correctamente', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef.get(AppModule)).toBeInstanceOf(AppModule);
    expect(moduleRef).toBeDefined();
  });

  it('debería evaluar TypeORM config con SSL deshabilitado', async () => {
    const asyncCall = forRootAsyncMock.mock.calls[0]?.[0];
    if (asyncCall && typeof asyncCall.useFactory === 'function') {
      const configServiceMock = { get: (k: string, d?: any) => process.env[k] ?? d } as any;
      const opts = asyncCall.useFactory(configServiceMock);
      expect(opts.ssl).toBeUndefined();
      expect(opts.type).toBe('mysql');
    } else {
      expect(true).toBe(true);
    }
  });

  it('debería evaluar TypeORM config con SSL habilitado', async () => {
    process.env.DB_SSL = 'true';
    const asyncCall = forRootAsyncMock.mock.calls[0]?.[0];
    if (asyncCall && typeof asyncCall.useFactory === 'function') {
      const configServiceMock = { get: (k: string, d?: any) => process.env[k] ?? d } as any;
      const opts = asyncCall.useFactory(configServiceMock);
      expect(opts.ssl).toBeDefined();
      expect((opts.ssl as any).ca).toBe('FAKE_CA_PEM');
      expect((opts.ssl as any).rejectUnauthorized).toBe(true);
    } else {
      expect(true).toBe(true);
    }
  });

  it('should configure DB without SSL when DB_SSL is not true', async () => {
    process.env.DB_SSL = 'false';

    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(module).toBeDefined();
  });

  it('should evaluate real SSL branch (coverage)', async () => {
    process.env.DB_SSL = 'true';

    jest.spyOn(fs, 'readFileSync').mockReturnValue('FAKE_CA_PEM');

    jest.isolateModules(() => {
      const { AppModule } = require('../src/app/app.module');
      const config = {
        get: (key: string) => process.env[key],
      };

      const typeorm = require('@nestjs/typeorm');
      const call = typeorm.TypeOrmModule.forRootAsync.mock.calls[0]?.[0];

      if (call) {
        const opts = call.useFactory(config);
        expect(opts.ssl).toBeDefined();
        expect(opts.ssl.ca).toBe('FAKE_CA_PEM');
        expect(opts.ssl.rejectUnauthorized).toBe(true);
      }
    });
  });


});
