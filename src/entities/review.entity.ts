import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { House } from './house.entity';
import { Reservation } from './reservation.entity';
import { Comment } from './comment.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => House, (house) => house.reviews)
  @JoinColumn({ name: 'houseId' })
  house: House;

  @OneToOne(() => Reservation, (reservation) => reservation.review)
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservation;

  @OneToOne(() => Comment, (comment) => comment.review)
  comment: Comment;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  houseId: number;

  @Column({ type: 'int' })
  reservationId: number;

  @Column({ type: 'varchar' })
  content: string;
}
