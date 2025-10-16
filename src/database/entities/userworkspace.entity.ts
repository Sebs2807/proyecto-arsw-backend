import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { use } from 'passport';
import { WorkspaceEntity } from './workspace.entity';

export enum Role {
  SUPER_ADMIN = 'superAdmin', // Only for initial setup
  ADMIN = 'admin', // Can manage users and settings
  MEMBER = 'member', // Regular user with standard permissions
  GUEST = 'guest', // Limited access, view-only
}

@Entity('user_workspace')
export class UserWorkspaceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.id, { onDelete: 'CASCADE' })
  workspace: WorkspaceEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
