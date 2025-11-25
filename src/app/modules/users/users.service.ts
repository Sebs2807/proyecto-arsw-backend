import { Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '../../../database/entities/user.entity';
import { UsersDBService } from 'src/database/dbservices/users.dbservice';
import { JwtService } from '@nestjs/jwt';
import { QueryUserDto } from './dtos/queryUser.dto';
import { UserDto } from './dtos/user.dto';
import { plainToInstance } from 'class-transformer';
import { AuthUserDto } from './dtos/authUser.dto';
import { Role } from 'src/database/entities/userworkspace.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersDbService: UsersDBService,
    private readonly jwtService: JwtService,
  ) {}

  async findAllByWorkspace(queryUser: QueryUserDto) {
    const { page, limit, search, role, boardId, workspaceId } = queryUser;

    try {
      const skip = (page - 1) * limit;

      const queryBuilder = this.usersDbService.repository
        .createQueryBuilder('user')
        .innerJoin('user.workspaces', 'uw', 'uw.workspaceId = :wsId', { wsId: workspaceId })
        .addSelect([
          'user.id AS id',
          'user.firstName AS firstName',
          'user.lastName AS lastName',
          'user.email AS email',
          'user.picture AS picture',
          'user.createdAt AS createdAt',
          'user.updatedAt AS updatedAt',
          'uw.role AS role',
        ]);

      if (role) {
        queryBuilder.andWhere('uw.role = :userRole', { userRole: role });
      }

      if (boardId) {
        queryBuilder
          .innerJoin('boards_members', 'bm', 'bm.usersId = user.id')
          .andWhere('bm.boardsId = :targetBoardId', { targetBoardId: boardId });
      }

      if (search) {
        queryBuilder.andWhere(
          '(user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
          { search: `%${search}%` },
        );
      }

      const total = await queryBuilder.getCount();

      queryBuilder.orderBy('user.createdAt', 'DESC').skip(skip).take(limit);

      const rawData = await queryBuilder.getRawMany();

      const transformedData = plainToInstance(UserDto, rawData, {
        excludeExtraneousValues: true,
      });

      const withEnumKeys = transformedData.map((user) => ({
        ...user,
        role:
          Object.keys(Role).find((key) => Role[key as keyof typeof Role] === user.role) ||
          user.role,
      }));

      this.logger.log(
        `Fetched ${withEnumKeys.length} users for workspace ${workspaceId} (page ${page}/${Math.ceil(total / limit)})`,
      );

      return {
        data: withEnumKeys,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching users by workspace: ${error.message}`, error.stack);
      throw new Error('Failed to fetch users by workspace');
    }
  }

  async findManyByEmail(queryUser: QueryUserDto & { excludeWorkspaceMembers?: boolean }) {
    try {
      console.log(queryUser);
      const page = Number(queryUser.page) || 1;
      const limit = Number(queryUser.limit) || 10;
      const search = queryUser.search || '';
      const workspaceId = queryUser.workspaceId;
      const excludeWorkspaceMembers = queryUser.excludeWorkspaceMembers ?? true;

      const skip = (page - 1) * limit;

      const queryBuilder = this.usersDbService.repository
        .createQueryBuilder('user')
        .select([
          'user.id AS id',
          'user.firstName AS firstName',
          'user.lastName AS lastName',
          'user.email AS email',
          'user.picture AS picture',
          'user.createdAt AS createdAt',
          'user.updatedAt AS updatedAt',
        ]);

      if (search) {
        queryBuilder.andWhere(
          '(user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
          { search: `%${search}%` },
        );
      }

      if (workspaceId) {
        if (excludeWorkspaceMembers) {
          queryBuilder.andWhere(
            `user.id NOT IN (
            SELECT uw.userId
            FROM user_workspace uw
            WHERE uw.workspaceId = :workspaceId
          )`,
            { workspaceId },
          );
        } else {
          console.log('hopla');
          queryBuilder.andWhere(
            `user.id IN (
            SELECT uw.userId
            FROM user_workspace uw
            WHERE uw.workspaceId = :workspaceId
          )`,
            { workspaceId },
          );
        }
      }

      const total = await queryBuilder.getCount();

      queryBuilder.orderBy('user.createdAt', 'DESC').skip(skip).take(limit);

      const rawData = await queryBuilder.getRawMany();

      const transformedData = plainToInstance(UserDto, rawData, {
        excludeExtraneousValues: true,
      });

      this.logger.log(
        `Fetched ${transformedData.length} users (page ${page}/${Math.ceil(total / limit)}) ${
          workspaceId
            ? excludeWorkspaceMembers
              ? `excluding workspace ${workspaceId}`
              : `only workspace ${workspaceId}`
            : ''
        }`,
      );

      return {
        items: transformedData,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error fetching users by email: ${error.message}`, error.stack);
      throw new Error('Failed to fetch users by email');
    }
  }

  async findByEmail(email: string): Promise<AuthUserDto | null> {
    try {
      const user = await this.usersDbService.repository.findOne({ where: { email } });
      if (!user) {
        this.logger.warn(`User with email ${email} not found`);
        return null;
      }

      return plainToInstance(AuthUserDto, user, { excludeExtraneousValues: true });
    } catch (error) {
      this.logger.error(`Error fetching user by email: ${error.message}`, error.stack);
      throw new Error('Failed to fetch user by email');
    }
  }

  async createUser(userData: Partial<UserEntity>): Promise<UserDto> {
    try {
      const newUser = this.usersDbService.repository.create(userData);
      const savedUser = await this.usersDbService.repository.save(newUser);

      if (!savedUser.id) {
        throw new Error('Created user does not have an ID');
      }

      this.logger.log(`User created with ID ${savedUser.id}`);

      return plainToInstance(UserDto, savedUser, { excludeExtraneousValues: true });
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw new Error('Failed to create user');
    }
  }

  async generateNewRefreshToken(userId: string): Promise<string> {
    try {
      if (!userId) throw new Error('User ID is required');

      const user = await this.usersDbService.repository.findOne({ where: { id: userId } });
      if (!user) {
        this.logger.warn(`User with ID ${userId} not found`);
        throw new Error('User not found');
      }

      const newRefreshToken = this.jwtService.sign(
        { id: user.id, email: user.email },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      );

      user.JWTRefreshToken = newRefreshToken;
      await this.usersDbService.repository.save(user);

      this.logger.log(`New refresh token generated for user ${userId}`);
      return newRefreshToken;
    } catch (error) {
      this.logger.error(`Error generating refresh token: ${error.message}`, error.stack);
      throw new Error('Failed to generate new refresh token');
    }
  }

  async create(data: Partial<UserEntity>) {
    const user = this.usersDbService.repository.create(data);
    return this.usersDbService.repository.save(user);
  }

  async updateUser(id: string, data: Partial<UserEntity>): Promise<UserDto> {
    const user = await this.usersDbService.repository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');

    Object.assign(user, data);
    const updatedUser = await this.usersDbService.repository.save(user);

    return plainToInstance(UserDto, updatedUser, { excludeExtraneousValues: true });
  }

  async deleteUser(id: string) {
    const result = await this.usersDbService.repository.delete(id);
    if (result.affected === 0) throw new Error('User not found');
    return { message: 'User deleted successfully' };
  }
}
