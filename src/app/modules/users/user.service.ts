import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './users.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserEntity)
		private usersRepository: Repository<UserEntity>,
	) {}

	async findByEmail(email: string): Promise<UserEntity | null> {
		return this.usersRepository.findOne({ where: { email } });
	}

	async createUser(userData: Partial<UserEntity>): Promise<UserEntity> {
		const user = this.usersRepository.create(userData);
		return this.usersRepository.save(user);
	}

	async findAll(): Promise<UserEntity[]> {
		return this.usersRepository.find();
	}
}
