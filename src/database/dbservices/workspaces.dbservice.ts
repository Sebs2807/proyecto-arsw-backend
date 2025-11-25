import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkspaceEntity } from '../entities/workspace.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WorkspacesDBService {
  private readonly logger = new Logger(WorkspacesDBService.name);
  public readonly repository: Repository<WorkspaceEntity>;

  constructor(
    @InjectRepository(WorkspaceEntity)
    workspaceRepository: Repository<WorkspaceEntity>,
  ) {
    this.repository = workspaceRepository;
  }

  async getWorkspacesByUserId(userId: string): Promise<WorkspaceEntity[]> {
    return this.repository
      .createQueryBuilder('workspace')
      .innerJoin('workspace.users', 'userWorkspace')
      .innerJoin('userWorkspace.user', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }
}
