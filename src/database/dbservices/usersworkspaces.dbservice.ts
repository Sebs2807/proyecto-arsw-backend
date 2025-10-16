import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserWorkspaceEntity } from '../entities/userworkspace.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersWorkspacesDBService {
  private readonly logger = new Logger(UsersWorkspacesDBService.name);
  public readonly repository: Repository<UserWorkspaceEntity>;
  constructor(
    @InjectRepository(UserWorkspaceEntity)
    usersWorkspacesRepository: Repository<UserWorkspaceEntity>,
  ) {
    this.repository = usersWorkspacesRepository;
  }
}
