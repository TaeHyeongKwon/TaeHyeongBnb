import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { House } from './house.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.reservations)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => House, (house) => house.reservation)
  @JoinColumn({ name: 'houseId' })
  house: House;

  @Column({ type: 'int' })
  houseId: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'date' })
  check_in: string;

  @Column({ type: 'date' })
  check_out: string;

  @BeforeInsert()
  async convertDates() {
    this.check_in = new Date(this.check_in).toISOString();
    this.check_out = new Date(this.check_out).toISOString();
  }
}
