// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthModule } from '../../../src/app/modules/auth/auth.module';
// import { AuthService } from '../../../src/app/modules/auth/auth.service';
// import { GoogleStrategy } from '../../../src/app/modules/auth/google.strategy';
// import { JwtStrategy } from '../../../src/app/modules/auth/jwt.strategy';

// const mockRepository = {};

// describe('AuthModule', () => {
//   let module: TestingModule;

//   beforeAll(async () => {
//     module = await Test.createTestingModule({
//       imports: [AuthModule],
//     })
//       .overrideProvider(GoogleStrategy)
//       .useValue({})
//       .overrideProvider(JwtStrategy)
//       .useValue({})
//       .overrideProvider('UserWorkspaceEntityRepository')
//       .useValue(mockRepository)
//       .overrideProvider('UserEntityRepository')
//       .useValue(mockRepository)
//       .overrideProvider('WorkspaceEntityRepository')
//       .useValue(mockRepository)
//       .overrideProvider('BoardEntityRepository')
//       .useValue(mockRepository)
//       .overrideProvider('ListEntityRepository')
//       .useValue(mockRepository)
//       .overrideProvider('CardEntityRepository')
//       .useValue(mockRepository)
//       .compile();
//   });

//   it('debe estar definido', () => {
//     const authModule = module.get<AuthModule>(AuthModule);
//     expect(authModule).toBeDefined();
//   });

//   it('debe proveer el AuthService', () => {
//     const service = module.get<AuthService>(AuthService);
//     expect(service).toBeDefined();
//   });
// });
