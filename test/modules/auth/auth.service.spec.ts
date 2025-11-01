import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/app/modules/users/users.service';
import { UsersDBService } from 'src/database/dbservices/users.dbservice';
import { WorkspacesService } from 'src/app/modules/workspaces/workspaces.service';
import { UsersWorkspacesService } from 'src/app/modules/users-workspaces/usersworkspaces.service';
import { BoardsService } from 'src/app/modules/boards/boards.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;
  let userDbService: UsersDBService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    generateNewRefreshToken: jest.fn(),
  };

  const mockUserDbService = {
    repository: {
      findOne: jest.fn(),
      save: jest.fn(),
    },
    findById: jest.fn(),
  };

  const mockWorkspacesService = {
    createWorkspace: jest.fn(),
  };

  const mockUsersWorkspacesService = {
    addUserToWorkspace: jest.fn(),
  };

  const mockBoardsService = {
    createBoard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: UsersDBService, useValue: mockUserDbService },
        { provide: WorkspacesService, useValue: mockWorkspacesService },
        { provide: UsersWorkspacesService, useValue: mockUsersWorkspacesService },
        { provide: BoardsService, useValue: mockBoardsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
    userDbService = module.get<UsersDBService>(UsersDBService);

    jest.clearAllMocks();
  });

  // ---------------------------
  // validateGoogleUser()
  // ---------------------------
  describe('validateGoogleUser', () => {
    it('debe retornar el usuario si existe', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateGoogleUser({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        picture: '',
        refreshToken: '',
      });

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateGoogleUser({
          email: 'unknown@example.com',
          firstName: '',
          lastName: '',
          picture: '',
          refreshToken: '',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ---------------------------
  // loginOrCreateGoogleUser()
  // ---------------------------
  describe('loginOrCreateGoogleUser', () => {
    it('debe crear un nuevo usuario y generar tokens', async () => {
      const newUser = { id: '123', email: 'new@example.com' };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.createUser.mockResolvedValue(newUser);
      mockWorkspacesService.createWorkspace.mockResolvedValue({ id: 'ws1' });
      mockBoardsService.createBoard.mockResolvedValue({ id: 'board1' });
      mockUsersWorkspacesService.addUserToWorkspace.mockResolvedValue(true);
      mockJwtService.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');
      mockUserDbService.repository.findOne.mockResolvedValue({ ...newUser });
      mockUserDbService.repository.save.mockResolvedValue({});

      const result = await service.loginOrCreateGoogleUser(
        'new@example.com',
        'New',
        'User',
        'pic.jpg',
        'googleRefreshToken',
      );

      expect(result).toEqual({ accessToken: 'accessToken', refreshToken: 'refreshToken' });
      expect(mockUsersService.createUser).toHaveBeenCalled();
      expect(mockWorkspacesService.createWorkspace).toHaveBeenCalled();
      expect(mockBoardsService.createBoard).toHaveBeenCalled();
      expect(mockUsersWorkspacesService.addUserToWorkspace).toHaveBeenCalled();
      expect(mockUserDbService.repository.save).toHaveBeenCalled();
    });

    it('debe loguear usuario existente y generar nuevo refresh token', async () => {
      const existingUser = { id: '1', email: 'existing@example.com' };
      mockUsersService.findByEmail.mockResolvedValue(existingUser);
      mockJwtService.sign.mockReturnValue('accessToken');
      mockUsersService.generateNewRefreshToken.mockResolvedValue('refreshToken');

      const result = await service.loginOrCreateGoogleUser(
        'existing@example.com',
        'Name',
        'User',
        'pic.jpg',
        'token',
      );

      expect(result).toEqual({ accessToken: 'accessToken', refreshToken: 'refreshToken' });
      expect(mockUsersService.generateNewRefreshToken).toHaveBeenCalledWith(existingUser.id);
    });

    it('debe capturar errores y lanzarlos', async () => {
      mockUsersService.findByEmail.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.loginOrCreateGoogleUser('error@example.com', '', '', '', ''),
      ).rejects.toThrow('DB Error');
    });
  });

  // ---------------------------
  // refreshAccessToken()
  // ---------------------------
  describe('refreshAccessToken', () => {
    it('debe refrescar tokens correctamente', async () => {
      const mockPayload = { id: '1', email: 'user@example.com' };
      const mockUser = { id: '1', email: 'user@example.com', JWTRefreshToken: 'oldRefresh' };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUserDbService.findById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('newAccess').mockReturnValueOnce('newRefresh');
      mockUserDbService.repository.save.mockResolvedValue({});

      const result = await service.refreshAccessToken('oldRefresh');

      expect(result).toEqual({
        accessToken: 'newAccess',
        refreshToken: 'newRefresh',
      });
      expect(mockJwtService.verify).toHaveBeenCalled();
      expect(mockUserDbService.repository.save).toHaveBeenCalled();
    });

    it('debe lanzar UnauthorizedException si el token no es válido', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.refreshAccessToken('badToken')).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el refresh token no coincide', async () => {
      const payload = { id: '1', email: 'user@example.com' };
      mockJwtService.verify.mockReturnValue(payload);
      mockUserDbService.findById.mockResolvedValue({
        id: '1',
        JWTRefreshToken: 'otherToken',
      });

      await expect(service.refreshAccessToken('wrongToken')).rejects.toThrow(UnauthorizedException);
    });
  });
});
