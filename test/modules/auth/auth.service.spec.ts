import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/app/modules/users/users.service';
import { UsersDBService } from 'src/database/dbservices/users.dbservice';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let usersDbService: UsersDBService;
  let jwtService: JwtService;
  let repository: Repository<UserEntity>;

  const mockUser = {
    id: '1',
    email: 'test@mail.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as UserEntity;

  const mockUsersDbService = {
    repository: {
      findAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
      findOne: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockReturnValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('fake-refresh-token'),
  };

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn().mockResolvedValue(mockUser),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersDBService, useValue: mockUsersDbService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: getRepositoryToken(UserEntity), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersDbService = module.get<UsersDBService>(UsersDBService);
    jwtService = module.get<JwtService>(JwtService);
    repository = module.get(getRepositoryToken(UserEntity));
  });

  // it('should return paginated users', async () => {
  //   const result = await service.findAll(1, 10);
  //   expect(usersDbService.repository.findAndCount).toHaveBeenCalled();
  //   expect(result.data).toHaveLength(1);
  //   expect(result.meta.total).toBe(1);
  // });

  it('should find a user by email', async () => {
    const result = await service.findByEmail('test@mail.com');
    expect(result).toEqual(expect.objectContaining({ email: 'test@mail.com' }));
  });

  it('should create a user', async () => {
    const result = await service.createUser({ email: 'test@mail.com' });
    expect(result).toEqual(expect.objectContaining({ email: 'test@mail.com' }));
  });

  it('should generate a new refresh token', async () => {
    const token = await service.generateNewRefreshToken('1');
    expect(jwtService.sign).toHaveBeenCalled();
    expect(token).toBe('fake-refresh-token');
  });

  it('should update a user', async () => {
    const result = await service.updateUser('1', { firstName: 'Updated' });
    expect(result).toEqual(expect.objectContaining({ firstName: 'Updated' }));
  });

  it('should delete a user', async () => {
    const result = await service.deleteUser('1');
    expect(result).toEqual({ message: 'User deleted successfully' });
  });
});
