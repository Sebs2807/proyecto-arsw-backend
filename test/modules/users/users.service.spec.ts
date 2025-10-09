import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/app/modules/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<UserEntity>;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should find user by email', async () => {
    const mockUser = { id: 1, email: 'test@example.com' } as UserEntity;
    mockUserRepository.findOne.mockResolvedValue(mockUser);

    const result = await service.findByEmail('test@example.com');
    expect(result).toEqual(mockUser);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
  });

  it('should return null if user not found', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    const result = await service.findByEmail('unknown@example.com');
    expect(result).toBeNull();
  });

  it('should create and save a new user', async () => {
    const userData = { email: 'new@example.com' } as Partial<UserEntity>;
    const mockUser = { id: 1, ...userData } as UserEntity;

    mockUserRepository.create.mockReturnValue(mockUser);
    mockUserRepository.save.mockResolvedValue(mockUser);

    const result = await service.createUser(userData);
    expect(result).toEqual(mockUser);
    expect(repo.create).toHaveBeenCalledWith(userData);
    expect(repo.save).toHaveBeenCalledWith(mockUser);
  });

  it('should return all users', async () => {
    const mockUsers = [{ id: 1 }, { id: 2 }] as UserEntity[];
    mockUserRepository.find.mockResolvedValue(mockUsers);

    const result = await service.findAll();
    expect(result).toEqual(mockUsers);
    expect(repo.find).toHaveBeenCalled();
  });
});
