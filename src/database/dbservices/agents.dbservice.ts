import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentEntity } from '../entities/agent.entity';

@Injectable()
export class AgentsDBService {
  private readonly logger = new Logger(AgentsDBService.name);
  readonly repository: Repository<AgentEntity>;

  constructor(
    @InjectRepository(AgentEntity)
    agentsRepository: Repository<AgentEntity>,
  ) {
    this.repository = agentsRepository;
  }
}
