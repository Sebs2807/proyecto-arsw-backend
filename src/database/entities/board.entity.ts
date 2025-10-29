import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { WorkspaceEntity } from './workspace.entity';

@Entity('boards')
export class BoardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => UserEntity, (user) => user.id)
  createdBy: UserEntity;

  @ManyToOne(() => WorkspaceEntity, (workpace) => workpace.id)
  workspace: WorkspaceEntity;

  @ManyToMany(() => UserEntity, { eager: true })
  @JoinTable({
    name: 'boards_members',
  })
  members: UserEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ length: 10, default: '#FFFFFF' })
  color: string;
}
