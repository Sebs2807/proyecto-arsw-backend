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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
