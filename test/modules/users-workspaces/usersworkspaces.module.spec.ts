// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersWorkspacesModule } from 'src/app/modules/users-workspaces/usersworkspaces.module';
// import { UsersWorkspacesService } from 'src/app/modules/users-workspaces/usersworkspaces.service';
// import { TypeOrmModule } from '@nestjs/typeorm';

// jest.mock('@nestjs/typeorm', () => ({
//   InjectRepository: jest.fn(() => () => {}),
//   TypeOrmModule: {
//     forFeature: jest.fn().mockReturnValue({
//       module: class MockTypeOrmModule {},
//     }),
//   },
// }));

// describe('UsersWorkspacesModule', () => {
//   let moduleRef: TestingModule;

//   beforeEach(async () => {
//     const mockService = {
//       create: jest.fn(),
//       findAll: jest.fn(),
//       findByUser: jest.fn(),
//     };

//     moduleRef = await Test.createTestingModule({
//       imports: [UsersWorkspacesModule],
//     })
//       .overrideProvider(UsersWorkspacesService)
//       .useValue(mockService)
//       .useMocker((token) => {
//         if (typeof token === 'function') return {};
//       })
//       .compile();
//   });

//   it('debería compilar correctamente el módulo', async () => {
//     const module = moduleRef.get(UsersWorkspacesModule);
//     expect(module).toBeInstanceOf(UsersWorkspacesModule);
//   });

//   it('debería definir el servicio UsersWorkspacesService', async () => {
//     const service = moduleRef.get<UsersWorkspacesService>(UsersWorkspacesService);
//     expect(service).toBeDefined();
//   });

//   it('debería exportar UsersWorkspacesService', async () => {
//     const metadata = Reflect.getMetadata('exports', UsersWorkspacesModule);
//     expect(metadata).toContain(UsersWorkspacesService);
//   });
// });
