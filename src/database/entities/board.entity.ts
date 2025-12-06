import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { WorkspaceEntity } from './workspace.entity';
import { ListEntity } from './list.entity';
import { AgentEntity } from './agent.entity';

@Entity('boards')
export class BoardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => UserEntity, (user) => user.id, { eager: true })
  createdBy: UserEntity;

  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.boards, {
    onDelete: 'CASCADE',
  })
  workspace: WorkspaceEntity;

  @ManyToMany(() => UserEntity, { eager: true })
  @JoinTable({
    name: 'boards_members',
  })
  members: UserEntity[];

  @OneToMany(() => ListEntity, (list) => list.board, { cascade: true })
  lists: ListEntity[];

  @ManyToMany(() => AgentEntity, (agent) => agent.boards)
  @JoinTable({
    name: 'boards_agents',
  })
  agents: AgentEntity[];
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ length: 10, default: '#FFFFFF' })
  color: string;
}
