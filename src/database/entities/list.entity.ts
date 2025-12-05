import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CardEntity } from './card.entity';
import { BoardEntity } from './board.entity';
import { AgentEntity } from './agent.entity';

@Entity('lists')
export class ListEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => BoardEntity, (board) => board.lists, { onDelete: 'CASCADE' })
  board: BoardEntity;

  @OneToMany(() => CardEntity, (card) => card.list, { cascade: true })
  cards: CardEntity[];

  @ManyToOne(() => AgentEntity, (agent) => agent.lists, { onDelete: 'SET NULL' })
  agent: AgentEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
