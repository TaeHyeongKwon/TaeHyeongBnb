import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity()
export class House {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Reservation, (reservation) => reservation.house)
  reservation: Reservation;

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
