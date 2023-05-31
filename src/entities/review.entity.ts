import { Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { House } from './house.entity';

export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => House, (house) => house.reviews)
  @JoinColumn({ name: 'houseId' })
  house: House;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  houseId: number;

  @Column({ type: 'varchar' })
  content: string;
}
