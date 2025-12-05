import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../../../src/app/modules/auth/auth.module';
import { AuthService } from '../../../src/app/modules/auth/auth.service';
import { GoogleStrategy } from '../../../src/app/modules/auth/google.strategy';
import { JwtStrategy } from '../../../src/app/modules/auth/jwt.strategy';

import { Module } from '@nestjs/common';
import { UsersModule } from '../../../src/app/modules/users/users.module';
import { UsersWorkspacesModule } from '../../../src/app/modules/users-workspaces/usersworkspaces.module';
import { WorkspacesModule } from '../../../src/app/modules/workspaces/workspaces.module';
import { BoardsModule } from '../../../src/app/modules/boards/boards.module';
// NEW IMPORTS FOR OVERRIDE
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';

// NEW IMPORTS: Import services required by AuthService constructor
import { UsersService } from '../../../src/app/modules/users/users.service';
import { WorkspacesService } from '../../../src/app/modules/workspaces/workspaces.service';
import { UsersWorkspacesService } from '../../../src/app/modules/users-workspaces/usersworkspaces.service';
import { BoardsService } from '../../../src/app/modules/boards/boards.service';
import { UsersDBService } from 'src/database/dbservices/users.dbservice';

// Define fake modules to replace complex imported modules (NOW EXPORTING NECESSARY SERVICES)
@Module({
  // UsersModule provides UsersService and UsersDBService
  providers: [UsersService, UsersDBService],
  exports: [UsersService, UsersDBService],
})
class FakeUsersModule {}

@Module({
  // UsersWorkspacesModule provides UsersWorkspacesService
  providers: [UsersWorkspacesService],
  exports: [UsersWorkspacesService],
})
class FakeUsersWorkspacesModule {}

@Module({
  // WorkspacesModule provides WorkspacesService
  providers: [WorkspacesService],
  exports: [WorkspacesService],
})
class FakeWorkspacesModule {}

@Module({
  // BoardsModule provides BoardsService
  providers: [BoardsService],
  exports: [BoardsService],
})
class FakeBoardsModule {}

// FAKE MODULES to override dynamic modules
@Module({})
class FakeJwtModule {}

@Module({})
class FakePassportModule {}

const mockRepository = {};

describe('AuthModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      // FIX: RE-ENABLING MODULE OVERRIDES AND EXPORTING SERVICES from the fake modules
      .overrideModule(UsersModule)
      .useModule(FakeUsersModule)
      .overrideModule(UsersWorkspacesModule)
      .useModule(FakeUsersWorkspacesModule)
      .overrideModule(WorkspacesModule)
      .useModule(FakeWorkspacesModule)
      .overrideModule(BoardsModule)
      .useModule(FakeBoardsModule)

      // Override core NestJS modules that use dynamic registration
      .overrideModule(JwtModule)
      .useModule(FakeJwtModule)
      .overrideModule(PassportModule)
      .useModule(FakePassportModule)

      // Strategies (Providers)
      .overrideProvider(GoogleStrategy)
      .useValue({})
      .overrideProvider(JwtStrategy)
      .useValue({})

      // Mock all services required by AuthService constructor
      // Note: We MUST still provide useValue here because the fake modules only export the *token*,
      // but the real implementation of the service is still being compiled and needs to be replaced
      // with a mock at the provider level.
      .overrideProvider(JwtService)
      .useValue({ sign: jest.fn(), verify: jest.fn() })
      .overrideProvider(UsersService)
      .useValue({})
      .overrideProvider(UsersDBService)
      .useValue({})
      .overrideProvider(WorkspacesService)
      .useValue({})
      .overrideProvider(UsersWorkspacesService)
      .useValue({})
      .overrideProvider(BoardsService)
      .useValue({})

      // Repository Mocks (Assuming these are provided via TypeOrmModule.forFeature in another module)
      .overrideProvider('UserWorkspaceEntityRepository')
      .useValue(mockRepository)
      .overrideProvider('UserEntityRepository')
      .useValue(mockRepository)
      .overrideProvider('WorkspaceEntityRepository')
      .useValue(mockRepository)
      .overrideProvider('BoardEntityRepository')
      .useValue(mockRepository)
      .overrideProvider('ListEntityRepository')
      .useValue(mockRepository)
      .overrideProvider('CardEntityRepository')
      .useValue(mockRepository)
      .compile();
  });

  it('debe estar definido', () => {
    const authModule = module.get<AuthModule>(AuthModule);
    expect(authModule).toBeDefined();
  });

  it('debe proveer el AuthService', () => {
    const service = module.get<AuthService>(AuthService);
    expect(service).toBeDefined();
  });
});
