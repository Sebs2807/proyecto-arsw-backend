import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { BoardEntity } from '../../../database/entities/board.entity';
import { BoardsDBService } from 'src/database/dbservices/boards.dbservice';
import { UsersDBService } from 'src/database/dbservices/users.dbservice';
import { UserEntity } from 'src/database/entities/user.entity';
import { QueryBoardDto } from './dtos/queryBoard.dto';
import { plainToInstance } from 'class-transformer';
import { BoardDto } from './dtos/board.dto';

@Injectable()
export class BoardsService {
  private readonly logger = new Logger(BoardsService.name);
  constructor(
    private readonly boardsDbService: BoardsDBService,
    private readonly usersDbService: UsersDBService,
  ) {}

  async createBoard(
    title: string,
    description: string | undefined,
    creatorId: string,
    membersIds: string[],
    workspaceId: string,
    color?: string,
  ): Promise<BoardEntity> {
    const memberEntitiesWithNulls = await Promise.all(
      membersIds.map((id) => this.usersDbService.findById(id)),
    );

    const validMemberEntities = memberEntitiesWithNulls.filter(
      (member): member is UserEntity => member !== null,
    );

    const board = this.boardsDbService.repository.create({
      title,
      description,
      createdBy: { id: creatorId },
      members: validMemberEntities,
      workspace: { id: workspaceId },
      color: color || '#2E2E5C',
    });

    return this.boardsDbService.repository.save(board);
  }

  async findAll(queryBoard: QueryBoardDto, userId: string) {
    try {
      const { search, workspaceId, page, limit } = queryBoard;
      const skip = (page - 1) * limit;

      const query = this.boardsDbService.repository
        .createQueryBuilder('board')
        .leftJoin('board.workspace', 'workspace')
        .leftJoin('board.createdBy', 'createdBy')
        .leftJoin('board.members', 'members')
        .leftJoinAndSelect('board.members', 'fullMembers')
        .where('workspace.id = :workspaceId', { workspaceId })
        .andWhere('(createdBy.id = :userId OR members.id = :userId)', { userId })
        .orderBy('board.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      if (search) {
        query.andWhere('LOWER(board.title) LIKE LOWER(:search)', { search: `%${search}%` });
      }

      const [boards, total] = await query.getManyAndCount();

      const boardsDTO = plainToInstance(BoardDto, boards, { excludeExtraneousValues: true });

      this.logger.log(`Fetched ${boards.length} boards (page ${page}/${Math.ceil(total / limit)})`);

      return {
        items: boardsDTO,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error fetching boards: ${error.message}`, error.stack);
      throw new ForbiddenException('Failed to fetch boards due to a server error.');
    }
  }

  async findOne(id: string): Promise<BoardEntity | null> {
    return this.boardsDbService.repository.findOne({ where: { id } });
  }

  async updateBoard(id: string, updateData: Partial<BoardEntity>) {
    await this.boardsDbService.repository.update(id, updateData);
    return this.findOne(id);
  }

  async deleteBoard(id: string) {
    await this.boardsDbService.repository.delete(id);
    return { deleted: true };
  }
}
