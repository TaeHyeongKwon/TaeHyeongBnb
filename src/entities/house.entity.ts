import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { User } from './user.entity';

@Entity()
export class House {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Reservation, (reservation) => reservation.house)
  reservation: Reservation;

  @ManyToOne(() => User, (user) => user.house)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10000 })
  description: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  university: string;

  @Column({ type: 'varchar' })
  houseType: string;

  @Column({ type: 'int' })
  pricePerDay: number;

  @Column({ type: 'json' })
  images: { key: number; url: string }[];
}
