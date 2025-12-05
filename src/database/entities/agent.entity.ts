import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { BoardEntity } from './board.entity';
import { ListEntity } from './list.entity';
import { WorkspaceEntity } from './workspace.entity';

@Entity('agents')
export class AgentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @ManyToMany(() => BoardEntity, (board) => board.agents)
  boards: BoardEntity[];

  @OneToMany(() => ListEntity, (list) => list.agent)
  lists: ListEntity[];

  @Column({ type: 'json', nullable: true })
  flowConfig: any;

  @Column({ type: 'float', default: 0.6 })
  temperature: number;

  @Column({ type: 'int', default: 500 })
  maxTokens: number;

  @Column({ type: 'timestamp', nullable: true })
  lastRunAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.boards, {
    onDelete: 'CASCADE',
  })
  workspace: WorkspaceEntity;
}
