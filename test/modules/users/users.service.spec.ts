import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/app/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UsersDBService } from 'src/database/dbservices/users.dbservice';
import { UserEntity } from 'src/database/entities/user.entity';
import { Logger } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: any;
  let mockUsersDBService: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockUsersDBService = { repository: mockUserRepository };
    mockJwtService = { sign: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersDBService, useValue: mockUsersDBService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should find a user by email', async () => {
    const mockUser = { id: '1', email: 'test@example.com' } as UserEntity;
    mockUserRepository.findOne.mockResolvedValue(mockUser);

    const result = await service.findByEmail('test@example.com');

    expect(result).toEqual(expect.objectContaining({ id: '1', email: 'test@example.com' }));
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
  });

  it('should return null if user not found by email', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    const result = await service.findByEmail('unknown@example.com');
    expect(result).toBeNull();
  });

  it('should create and save a new user', async () => {
    const userData = { email: 'new@example.com' } as Partial<UserEntity>;
    const mockUser = { id: '1', ...userData } as UserEntity;

    mockUserRepository.create.mockReturnValue(mockUser);
    mockUserRepository.save.mockResolvedValue(mockUser);

    const result = await service.createUser(userData);

    expect(result).toEqual(expect.objectContaining({ id: '1', email: 'new@example.com' }));
    expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('should generate a new refresh token and save it', async () => {
    const user: UserEntity = { id: '1', email: 'user@test.com' } as UserEntity;
    const newToken = 'mockNewToken';

    mockUserRepository.findOne.mockResolvedValue(user);
    mockJwtService.sign.mockReturnValue(newToken);
    mockUserRepository.save.mockResolvedValue({ ...user, JWTRefreshToken: newToken });

    const result = await service.generateNewRefreshToken('1');

    expect(result).toBe(newToken);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(mockJwtService.sign).toHaveBeenCalled();
    expect(mockUserRepository.save).toHaveBeenCalled();
  });

  it('should throw error if user not found for refresh token', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    await expect(service.generateNewRefreshToken('nonexistent')).rejects.toThrow(
      'Failed to generate new refresh token',
    );
  });

  it('should update an existing user', async () => {
    const user = { id: '1', email: 'old@mail.com' } as UserEntity;
    const updates = { email: 'updated@mail.com' };
    mockUserRepository.findOne.mockResolvedValue(user);
    mockUserRepository.save.mockResolvedValue({ ...user, ...updates });

    const result = await service.updateUser('1', updates);

    expect(result.email).toBe('updated@mail.com');
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should throw if user not found when updating', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    await expect(service.updateUser('99', {})).rejects.toThrow('User not found');
  });

  it('should delete a user successfully', async () => {
    mockUserRepository.delete.mockResolvedValue({ affected: 1 });
    const result = await service.deleteUser('1');
    expect(result).toEqual({ message: 'User deleted successfully' });
  });

  it('should throw if user not found when deleting', async () => {
    mockUserRepository.delete.mockResolvedValue({ affected: 0 });
    await expect(service.deleteUser('99')).rejects.toThrow('User not found');
  });

  it('should return paginated users by workspace', async () => {
    const mockQB = {
      innerJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(2),
      getRawMany: jest.fn().mockResolvedValue([
        { id: '1', email: 'u1@mail.com', role: 'ADMIN' },
        { id: '2', email: 'u2@mail.com', role: 'MEMBER' },
      ]),
    };

    mockUserRepository.createQueryBuilder.mockReturnValue(mockQB);

    const result = await service.findAllByWorkspace({
      page: 1,
      limit: 10,
      workspaceId: 'ws1',
    } as any);

    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
    expect(mockQB.getCount).toHaveBeenCalled();
  });

  it('should log and throw error if queryBuilder fails', async () => {
    const mockQB = { innerJoin: jest.fn().mockImplementation(() => { throw new Error('DB error'); }) };
    mockUserRepository.createQueryBuilder.mockReturnValue(mockQB);

    const loggerSpy = jest.spyOn(Logger.prototype, 'error');

    await expect(
      service.findAllByWorkspace({ page: 1, limit: 10, workspaceId: 'ws1' } as any),
    ).rejects.toThrow('Failed to fetch users by workspace');

    expect(loggerSpy).toHaveBeenCalled();
  });

  it('should throw error if created user has no ID', async () => {
    const mockUser = { email: 'noid@mail.com' } as UserEntity;
    mockUserRepository.create.mockReturnValue(mockUser);
    mockUserRepository.save.mockResolvedValue(mockUser);

    await expect(service.createUser(mockUser)).rejects.toThrow('Failed to create user');
  });

  it('should throw error if no userId is provided for refresh token', async () => {
    await expect(service.generateNewRefreshToken('')).rejects.toThrow(
      'Failed to generate new refresh token',
    );
  });

  it('should log and throw if findByEmail fails', async () => {
    mockUserRepository.findOne.mockImplementation(() => {
      throw new Error('DB fail');
    });
    const loggerSpy = jest.spyOn(Logger.prototype, 'error');
    await expect(service.findByEmail('fail@mail.com')).rejects.toThrow('Failed to fetch user by email');
    expect(loggerSpy).toHaveBeenCalled();
  });

  it('should return filtered users excluding workspace', async () => {
    const mockQB = {
      select: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(2),
      getRawMany: jest.fn().mockResolvedValue([
        { id: '1', email: 'a@mail.com' },
        { id: '2', email: 'b@mail.com' },
      ]),
    };
    mockUserRepository.createQueryBuilder.mockReturnValue(mockQB);

    const result = await service.findManyByEmail({
      page: 1,
      limit: 5,
      search: 'a',
      workspaceId: 'ws1',
    } as any);

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('should catch and log error in findManyByEmail', async () => {
    const mockQB = { select: jest.fn().mockImplementation(() => { throw new Error('DB crash'); }) };
    mockUserRepository.createQueryBuilder.mockReturnValue(mockQB);
    const loggerSpy = jest.spyOn(Logger.prototype, 'error');
    await expect(service.findManyByEmail({ page: 1, limit: 10 } as any)).rejects.toThrow(
      'Failed to fetch users by email',
    );
    expect(loggerSpy).toHaveBeenCalled();
  });

  it('should apply filters for role, boardId and search', async () => {
    const mockQB = {
      innerJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
      getRawMany: jest.fn().mockResolvedValue([{ id: '1', email: 'test@mail.com', role: 'ADMIN' }]),
    };
    mockUserRepository.createQueryBuilder.mockReturnValue(mockQB);

    const result = await service.findAllByWorkspace({
      page: 1,
      limit: 10,
      search: 'test',
      role: 'ADMIN',
      boardId: 'board123',
      workspaceId: 'ws1',
    } as any);

    expect(result.meta.totalPages).toBe(1);
    expect(mockQB.andWhere).toHaveBeenCalled();
  });

  it('should create user using create() method directly', async () => {
    const user = { email: 'simple@mail.com' } as UserEntity;
    mockUserRepository.create.mockReturnValue(user);
    mockUserRepository.save.mockResolvedValue({ ...user, id: '1' });

    const result = await service.create(user);
    expect(result).toEqual(expect.objectContaining({ id: '1', email: 'simple@mail.com' }));
  });

});

