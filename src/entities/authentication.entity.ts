import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Authentication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expiration: Date;
}
