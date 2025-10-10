import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersDBService {
  private readonly logger = new Logger(UsersDBService.name);
  public readonly repository: Repository<UserEntity>;

  constructor(
    @InjectRepository(UserEntity)
    usersRepository: Repository<UserEntity>,
  ) {
    this.repository = usersRepository;
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const user = await this.repository.findOne({ where: { id } });
      return user || null;
    } catch (err: unknown) {
      let message = 'Unknown error';
      if (err instanceof Error) {
        message = err.message;
      }
      this.logger.error(`Error finding user by id ${id}: ${message}`);
      return null;
    }
  }
}
