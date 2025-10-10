import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardEntity } from '../../../database/entities/board.entity';
import { UserEntity } from '../../../database/entities/user.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardEntity)
    private boardsRepository: Repository<BoardEntity>,
  ) {}

  async createBoard(
    title: string,
    description: string | undefined,
    creator: UserEntity,
    members: UserEntity[],
  ): Promise<BoardEntity> {
    if (!creator || !('roles' in creator) || creator['roles'] !== 'ADMIN') {
      throw new ForbiddenException('Solo un ADMIN puede crear tableros');
    }

    const board = this.boardsRepository.create({
      title,
      description,
      createdBy: creator,
      members,
    });

    return this.boardsRepository.save(board);
  }

  async findAll(): Promise<BoardEntity[]> {
    return this.boardsRepository.find();
  }

  async findOne(id: string): Promise<BoardEntity | null> {
    return this.boardsRepository.findOne({ where: { id } });
  }

  async updateBoard(id: string, updateData: Partial<BoardEntity>) {
    await this.boardsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async deleteBoard(id: string) {
    await this.boardsRepository.delete(id);
    return { deleted: true };
  }
}
