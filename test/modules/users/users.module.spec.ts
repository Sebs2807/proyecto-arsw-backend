// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersModule } from 'src/app/modules/users/users.module';
// import { UsersService } from 'src/app/modules/users/users.service';
// import { UsersDBService } from 'src/database/dbservices/users.dbservice';
// import { UsersController } from 'src/app/modules/users/users.controller';
// import { JwtService } from '@nestjs/jwt';

// jest.mock('@nestjs/typeorm', () => ({
//   InjectRepository: jest.fn(() => () => {}),
//   TypeOrmModule: {
//     forFeature: jest.fn().mockReturnValue({
//       module: class MockTypeOrmModule {},
//     }),
//   },
// }));

// describe('UsersModule', () => {
//   let moduleRef: TestingModule;

//   beforeEach(async () => {
//     const mockRepository = {
//       findOne: jest.fn(),
//       find: jest.fn(),
//       save: jest.fn(),
//       delete: jest.fn(),
//     };

//     const mockUsersDBService = {
//       repository: mockRepository,
//       findById: jest.fn(),
//     };

//     const mockUsersService = {
//       create: jest.fn(),
//       findAll: jest.fn(),
//       findByEmail: jest.fn(),
//     };

//     const mockJwtService = {
//       sign: jest.fn(),
//       verify: jest.fn(),
//     };

//     moduleRef = await Test.createTestingModule({
//       imports: [UsersModule],
//     })
//       .overrideProvider(UsersDBService)
//       .useValue(mockUsersDBService)
//       .overrideProvider(UsersService)
//       .useValue(mockUsersService)
//       .overrideProvider(JwtService)
//       .useValue(mockJwtService)
//       .useMocker((token) => {
//         if (typeof token === 'function') {
//           return {};
//         }
//       })
//       .compile();
//   });

//   it('debería compilar correctamente el módulo', async () => {
//     const module = moduleRef.get(UsersModule);
//     expect(module).toBeInstanceOf(UsersModule);
//   });

//   it('debería inyectar el servicio UsersDBService', async () => {
//     const dbService = moduleRef.get<UsersDBService>(UsersDBService);
//     expect(dbService).toBeDefined();
//   });

//   it('debería inyectar el servicio UsersService', async () => {
//     const service = moduleRef.get<UsersService>(UsersService);
//     expect(service).toBeDefined();
//   });

//   it('debería definir el controlador UsersController', async () => {
//     const controller = moduleRef.get<UsersController>(UsersController);
//     expect(controller).toBeDefined();
//   });

//   it('debería exportar UsersDBService y UsersService', async () => {
//     const metadata = Reflect.getMetadata('exports', UsersModule);
//     expect(metadata).toContain(UsersDBService);
//     expect(metadata).toContain(UsersService);
//   });
// });
