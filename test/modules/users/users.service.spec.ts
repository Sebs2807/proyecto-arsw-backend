import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/app/modules/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersDBService } from 'src/database/dbservices/users.dbservice';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<UserEntity>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUsersDBService = {
    repository: mockUserRepository,
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersDBService, useValue: mockUsersDBService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  // --- FIND USER BY EMAIL ---
  it('should find a user by email', async () => {
    const mockUser = { id: '1', email: 'test@example.com' } as UserEntity;
    mockUserRepository.findOne.mockResolvedValue(mockUser);

    const result = await service.findByEmail('test@example.com');

    expect(result).toEqual(mockUser);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
  });

  it('should return null if no user is found', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    const result = await service.findByEmail('unknown@example.com');

    expect(result).toBeNull();
  });

  // --- CREATE USER ---
  it('should create and save a new user', async () => {
    const userData = { email: 'new@example.com' } as Partial<UserEntity>;
    const mockUser = { id: '1', ...userData } as UserEntity;

    mockUserRepository.create.mockReturnValue(mockUser);
    mockUserRepository.save.mockResolvedValue(mockUser);

    const result = await service.createUser(userData);

    expect(result).toEqual(mockUser);
    expect(repo.create).toHaveBeenCalledWith(userData);
    expect(repo.save).toHaveBeenCalledWith(mockUser);
  });

  // --- FIND ALL USERS ---
  it('should return all users', async () => {
    const mockUsers = [{ id: '1' }, { id: '2' }] as UserEntity[];
    mockUserRepository.find.mockResolvedValue(mockUsers);

    const result = await service.findAll();

    expect(result).toEqual(mockUsers);
    expect(repo.find).toHaveBeenCalled();
  });

  // --- GENERATE NEW REFRESH TOKEN ---
  it('should generate a new refresh token and save it', async () => {
    const user: UserEntity = {
      id: '1',
      email: 'user@test.com',
      JWTRefreshToken: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as UserEntity;
    const newToken = 'mockNewToken';

    mockUserRepository.findOne.mockResolvedValue(user);
    mockJwtService.sign.mockReturnValue(newToken);
    mockUserRepository.save.mockResolvedValue({ ...user, JWTRefreshToken: newToken });

    const result = await service.generateNewRefreshToken('1');

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(jwtService.sign).toHaveBeenCalledWith(
      { id: user.id, email: user.email },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );
    expect(mockUserRepository.save).toHaveBeenCalledWith({ ...user, JWTRefreshToken: newToken });
    expect(result).toBe(newToken);
  });

  it('should throw an error if user not found when generating refresh token', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.generateNewRefreshToken('nonexistent')).rejects.toThrow('User not found');
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'nonexistent' } });
  });

  it('should throw and log error if jwtService.sign fails', async () => {
    const user: UserEntity = {
      id: '2',
      email: 'fail@test.com',
      JWTRefreshToken: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as UserEntity;

    mockUserRepository.findOne.mockResolvedValue(user);
    mockJwtService.sign.mockImplementation(() => {
      throw new Error('JWT error');
    });

    const loggerSpy = jest.spyOn(Logger.prototype, 'error');

    await expect(service.generateNewRefreshToken('2')).rejects.toThrow('JWT error');
    expect(loggerSpy).toHaveBeenCalled();
  });
});
