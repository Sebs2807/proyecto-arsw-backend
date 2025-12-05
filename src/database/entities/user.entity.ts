import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserWorkspaceEntity } from './userworkspace.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ type: 'text', nullable: true })
  googleRefreshToken: string | null;

  @Column({ type: 'text', nullable: true })
  JWTRefreshToken: string | null;

  @OneToMany(() => UserWorkspaceEntity, (userWorkspace) => userWorkspace.user)
  workspaces: UserWorkspaceEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
