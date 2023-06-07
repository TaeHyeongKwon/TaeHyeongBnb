import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Host } from './host.entity';
import { House } from './house.entity';
import { Review } from './review.entity';
import { Comment } from './comment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];

  @OneToOne(() => Host, (host) => host.user)
  host: Host;

  @OneToMany(() => House, (house) => house.user)
  houses: House[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  nickname: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar', default: 'local' })
  registration_path: string;

  @Column({ type: 'boolean', nullable: true })
  host_certification: boolean;
}
