import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  nickname: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar', default: 'local' })
  registration_path: string;
}
