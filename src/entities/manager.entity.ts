import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Manager {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  M_name: string;

  @Column({ type: 'varchar' })
  M_email: string;

  @Column({ type: 'varchar' })
  M_password: string;
}
