import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { UsersService } from 'src/app/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { UserEntity } from 'src/database/entities/user.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUserService = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate user successfully', async () => {
    const mockUser = { email: 'test@example.com', password: 'hashed' } as UserEntity;
    mockUserService.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser('test@example.com', '1234');
    expect(result).toEqual(mockUser);
  });

  it('should return null if user not found', async () => {
    mockUserService.findByEmail.mockResolvedValue(null);
    const result = await service.validateUser('unknown@example.com', '1234');
    expect(result).toBeNull();
  });

  it('should return null if password mismatch', async () => {
    const mockUser = { password: 'hashed' } as UserEntity;
    mockUserService.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await service.validateUser('test@example.com', 'wrong');
    expect(result).toBeNull();
  });

  it('should login and return access_token', async () => {
    const mockUser = { id: 1, email: 'test@example.com' } as UserEntity;
    mockJwtService.sign.mockReturnValue('jwt_token');

    const result = await service.login(mockUser);
    expect(result).toEqual({ access_token: 'jwt_token' });
  });

  it('should throw UnauthorizedException if google user not found', async () => {
    mockUserService.findByEmail.mockResolvedValue(null);
    await expect(service.validateGoogleUser({ email: 'none@example.com' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should register a new user', async () => {
    const dto = { email: 'new@example.com', password: '1234', name: 'Test' };
    mockUserService.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    mockUserService.createUser.mockResolvedValue({ id: 1, ...dto });

    const result = await service.registerWithEmail(dto as any);
    expect(result).toMatchObject({ email: dto.email });
    expect(bcrypt.hash).toHaveBeenCalled();
  });

  it('should register or return existing google user', async () => {
    const googleUser = { email: 'google@example.com', displayName: 'GUser' };
    mockUserService.findByEmail.mockResolvedValue(null);
    mockUserService.createUser.mockResolvedValue({ id: 1, email: googleUser.email });

    const result = await service.registerGoogleUser(googleUser);
    expect(result).toHaveProperty('email', googleUser.email);
  });
});
