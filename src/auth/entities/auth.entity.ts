import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  username: string;
  @Column()
  password: string;
}
