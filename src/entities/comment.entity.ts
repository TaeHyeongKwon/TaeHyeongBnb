import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Review } from './review.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Review, (review) => review.comment)
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  reviewId: number;

  @Column({ type: 'varchar', length: 300 })
  content: string;
}
