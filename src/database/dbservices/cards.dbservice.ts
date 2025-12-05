import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardEntity } from '../entities/card.entity';

@Injectable()
export class CardsDBService {
  private readonly logger = new Logger(CardsDBService.name);
  readonly repository: Repository<CardEntity>;

  constructor(
    @InjectRepository(CardEntity)
    agentsRepository: Repository<CardEntity>,
  ) {
    this.repository = agentsRepository;
  }
}
