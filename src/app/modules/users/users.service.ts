import { Injectable, Logger} from '@nestjs/common';
import { UserEntity } from '../../../database/entities/user.entity';
import { UsersDBService } from 'src/database/dbservices/users.dbservice';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private usersDbService: UsersDBService,
    private readonly jwtService: JwtService,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersDbService.repository.findOne({ where: { email } });
  }

  async createUser(userData: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.usersDbService.repository.create(userData);
    return this.usersDbService.repository.save(user);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.usersDbService.repository.find();
  }

  async generateNewRefreshToken(userId: string): Promise<string> {
    try {
      const user = await this.usersDbService.repository.findOne({ where: { id: userId } });
      console.log('User fetched for refresh token generation:', user);
      if (!user) {
        this.logger.warn(`User with ID ${userId} not found for refresh token generation`);
        throw new Error('User not found');
      } else {
        const newRefreshToken = this.jwtService.sign(
          { id: user.id, email: user.email },
          { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
        );
        user.JWTRefreshToken = newRefreshToken;
        await this.usersDbService.repository.save(user);
        console.log('New refresh token generated and saved:', newRefreshToken);
        return newRefreshToken;
      }
    } catch (error: unknown) {
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
      }
      this.logger.error(`Error generating new refresh token for user ID ${userId}: ${message}`);
      throw error;
    }
  }
}
