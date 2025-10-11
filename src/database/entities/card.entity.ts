import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ListEntity } from './list.entity';
import { UserEntity } from './user.entity';

@Entity('cards')
export class CardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 'new' })
  status: string;

  @Column({ nullable: true })
  priority?: 'low' | 'medium' | 'high';

  @ManyToOne(() => ListEntity, (list) => list.cards, { onDelete: 'CASCADE' })
  list: ListEntity;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
