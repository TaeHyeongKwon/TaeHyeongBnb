import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Manager {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'M_name' })
  name: string;

  @Column({ type: 'varchar', name: 'M_email' })
  email: string;

  @Column({ type: 'varchar', name: 'M_password' })
  password: string;

  @Column({ type: 'varchar', name: 'M_department' })
  department: string;

  @Column({ type: 'varchar', name: 'M_position' })
  position: string;
}
