import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserWorkspaceEntity } from './userworkspace.entity';
import { BoardEntity } from './board.entity';

@Entity('workspaces')
export class WorkspaceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @OneToMany(() => UserWorkspaceEntity, (userWorkspace) => userWorkspace.workspace, {
    cascade: true,
  })
  users: UserWorkspaceEntity[];

  @OneToMany(() => BoardEntity, (board) => board.workspace, {
    cascade: true,
  })
  boards: BoardEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
