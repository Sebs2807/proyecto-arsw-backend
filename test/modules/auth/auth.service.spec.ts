import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { UsersService } from 'src/app/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UsersDBService } from 'src/database/dbservices/users.dbservice';
import { UserEntity } from 'src/database/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    generateNewRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUserDbService = {
    findById: jest.fn(),
    repository: { save: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersDBService, useValue: mockUserDbService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  // --- VALIDATE GOOGLE USER ---
  it('should throw UnauthorizedException if Google user not found', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.validateGoogleUser({
        email: 'none@example.com',
        firstName: 'None',
        lastName: 'User',
        picture: 'pic.jpg',
        refreshToken: 'refresh123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return user if Google user exists', async () => {
    const mockUser: UserEntity = {
      id: 'adasdasdasda',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      picture: 'pic.jpg',
      JWTRefreshToken: 'refresh123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUsersService.findByEmail.mockResolvedValue(mockUser);

    const result = await service.validateGoogleUser({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      picture: 'pic.jpg',
      refreshToken: 'refresh123',
    });

    expect(result).toBe(mockUser);
  });

  // --- LOGIN OR CREATE GOOGLE USER ---
  it('should create a new user if not found', async () => {
    const newUser: UserEntity = {
      id: 'adasdasdasda',
      email: 'new@example.com',
      firstName: 'Test',
      lastName: 'User',
      picture: 'pic.jpg',
      JWTRefreshToken: 'googleRefresh',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUsersService.findByEmail.mockResolvedValue(null);
    mockUsersService.createUser.mockResolvedValue(newUser);
    mockJwtService.sign.mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken');

    const result = await service.loginOrCreateGoogleUser(
      'new@example.com',
      'Test',
      'User',
      'pic.jpg',
      'googleRefresh',
    );

    expect(mockUsersService.createUser).toHaveBeenCalled();
    expect(mockUserDbService.repository.save).toHaveBeenCalled();
    expect(result).toEqual({ accessToken: 'accessToken', refreshToken: 'refreshToken' });
  });

  it('should reuse existing user and refresh token', async () => {
    const existingUser: UserEntity = {
      id: 'adasdasdasda',
      email: 'exists@example.com',
      firstName: 'Old',
      lastName: 'User',
      picture: 'old.jpg',
      JWTRefreshToken: 'oldRefresh',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUsersService.findByEmail.mockResolvedValue(existingUser);
    mockUsersService.generateNewRefreshToken.mockResolvedValue('newRefresh');
    mockJwtService.sign.mockReturnValue('accessToken');

    const result = await service.loginOrCreateGoogleUser(
      'exists@example.com',
      'Test',
      'User',
      'pic.jpg',
      'googleRefresh',
    );

    expect(mockUsersService.findByEmail).toHaveBeenCalledWith('exists@example.com');
    expect(mockUsersService.generateNewRefreshToken).toHaveBeenCalledWith('adasdasdasda');
    expect(result).toEqual({ accessToken: 'accessToken', refreshToken: 'newRefresh' });
  });

  // --- REFRESH ACCESS TOKEN ---
  it('should refresh access token successfully', async () => {
    const mockUser: UserEntity = {
      id: 'adasdasdasda',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      picture: 'pic.jpg',
      JWTRefreshToken: 'validToken',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockJwtService.verify.mockReturnValue({ id: 'adasdasdasda', email: 'test@example.com' });
    mockUserDbService.findById.mockResolvedValue(mockUser);
    mockJwtService.sign.mockReturnValueOnce('newAccess').mockReturnValueOnce('newRefresh');

    const result = await service.refreshAccessToken('validToken');

    expect(mockUserDbService.repository.save).toHaveBeenCalled();
    expect(result).toEqual({ accessToken: 'newAccess', refreshToken: 'newRefresh' });
  });

  it('should throw if refresh token is invalid', async () => {
    mockJwtService.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await expect(service.refreshAccessToken('invalid')).rejects.toThrow(UnauthorizedException);
  });
});
