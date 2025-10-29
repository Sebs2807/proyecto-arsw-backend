import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardEntity } from '../entities/board.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class BoardsDBService {
  private readonly logger = new Logger(BoardsDBService.name);
  readonly repository: Repository<BoardEntity>;

  constructor(
    @InjectRepository(BoardEntity)
    boardsRepository: Repository<BoardEntity>,
  ) {
    this.repository = boardsRepository;
  }

  async getBoardMembers(boardId: string): Promise<Partial<UserEntity>[]> {
    const board = await this.repository.findOne({
      where: { id: boardId },
      relations: ['members'],
    });

    if (!board) {
      this.logger.warn(`Tablero con ID ${boardId} no encontrado`);
      throw new NotFoundException('Board not found');
    }

    return board.members.map((member) => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
    }));
  }
}
