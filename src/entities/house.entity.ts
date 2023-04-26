import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity()
export class House {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Reservation, (reservation) => reservation.house)
  reservation: Reservation;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  address: string;

  @Column()
  university: string;

  @Column()
  houseType: string;

  @Column()
  pricePerDay: number;

  @Column({ type: 'json' })
  images: { key: number; url: string }[];
}
