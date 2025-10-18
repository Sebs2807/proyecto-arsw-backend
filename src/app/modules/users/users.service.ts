import { Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '../../../database/entities/user.entity';
import { UsersDBService } from 'src/database/dbservices/users.dbservice';
import { JwtService } from '@nestjs/jwt';
import { FindManyOptions, Like } from 'typeorm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersDbService: UsersDBService,
    private readonly jwtService: JwtService,
  ) {}

  // Devuelve solo los campos públicos de un usuario
  private sanitizeUser(
    user: UserEntity,
  ): Omit<UserEntity, 'JWTRefreshToken' | 'googleRefreshToken'> {
    const { JWTRefreshToken, googleRefreshToken, ...safeUser } = user;
    return safeUser;
  }

  // Obtiene todos los usuarios con paginación y búsqueda
  async findAll(page = 1, limit = 10, search?: string) {
    try {
      const skip = (page - 1) * limit;

      const options: FindManyOptions<UserEntity> = {
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      };

      if (search) {
        options.where = [
          { email: Like(`%${search}%`) },
          { firstName: Like(`%${search}%`) },
          { lastName: Like(`%${search}%`) },
        ];
      }

      const [data, total] = await this.usersDbService.repository.findAndCount(options);

      this.logger.log(`Fetched ${data.length} users (page ${page}/${Math.ceil(total / limit)})`);

      return {
        data: data.map((user) => this.sanitizeUser(user)),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching users: ${error.message}`, error.stack);
      throw new Error('Failed to fetch users');
    }
  }

  // Busca usuario por email
  async findByEmail(
    email: string,
  ): Promise<Omit<UserEntity, 'JWTRefreshToken' | 'googleRefreshToken'> | null> {
    try {
      const user = await this.usersDbService.repository.findOne({ where: { email } });
      if (!user) {
        this.logger.warn(`User with email ${email} not found`);
        return null;
      }
      return this.sanitizeUser(user);
    } catch (error) {
      this.logger.error(`Error fetching user by email: ${error.message}`, error.stack);
      throw new Error('Failed to fetch user by email');
    }
  }

  // Crea un usuario nuevo
  async createUser(
    userData: Partial<UserEntity>,
  ): Promise<Omit<UserEntity, 'JWTRefreshToken' | 'googleRefreshToken'>> {
    try {
      const newUser = this.usersDbService.repository.create(userData);
      const savedUser = await this.usersDbService.repository.save(newUser);

      if (!savedUser.id) {
        throw new Error('Created user does not have an ID');
      }

      this.logger.log(`User created with ID ${savedUser.id}`);
      return this.sanitizeUser(savedUser);
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw new Error('Failed to create user');
    }
  }

  // Genera un refresh token nuevo para un usuario
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
}
