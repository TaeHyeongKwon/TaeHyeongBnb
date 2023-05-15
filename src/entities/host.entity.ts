import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Host {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.host)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'date' })
  birth_date: string;

  @Column({ type: 'int' })
  phone_number: number;

  @Column({ type: 'boolean', default: false })
  approval: boolean;
}
