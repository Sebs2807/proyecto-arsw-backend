import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/app/modules/auth/auth.controller';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UserEntity } from 'src/database/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;
  let res: Partial<Response>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            registerWithEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
    jwtService = moduleRef.get<JwtService>(JwtService);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
  });

  it('debería retornar error si las credenciales son inválidas', async () => {
    jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

    await controller.login({ email: 'test@mail.com', password: 'wrong' }, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales inválidas' });
  });

  it('debería loguear correctamente si las credenciales son válidas', async () => {
    const user: Partial<UserEntity> = { id: 1, email: 'test@mail.com' };

    jest.spyOn(authService, 'validateUser').mockResolvedValue(user as UserEntity);

    await controller.login({ email: 'test@mail.com', password: '1234' }, res as Response);

    expect(authService.validateUser).toHaveBeenCalled();
    expect(jwtService.sign).toHaveBeenCalledWith({ id: user.id, email: user.email });
    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: 'Login exitoso',
      user: { id: user.id, email: user.email },
    });
  });

  it('debería registrar un usuario exitosamente', async () => {
    const user: Partial<UserEntity> = { id: 2, email: 'new@mail.com' };

    jest.spyOn(authService, 'registerWithEmail').mockResolvedValue(user as UserEntity);

    await controller.register({ email: user.email!, password: '1234', name: '' }, res as Response);

    expect(authService.registerWithEmail).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: 'Registro exitoso',
      user: { id: user.id, email: user.email },
    });
  });
});
