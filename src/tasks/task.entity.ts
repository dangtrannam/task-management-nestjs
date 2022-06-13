import { Auth } from './../auth/entities/auth.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from './task.enum';
import { Exclude } from 'class-transformer';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: TaskStatus;

  @ManyToOne((_type) => Auth, (auth) => auth.tasks, { eager: false })
  @Exclude({ toPlainOnly: true })
  user: Auth;
}
