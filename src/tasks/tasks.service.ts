import { Auth } from './../auth/entities/auth.entity';
import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Task } from './task.entity';
import { TaskStatus } from './task.enum';

@Injectable()
export class TasksService {
  private logger = new Logger('TasksService', { timestamp: true });
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: Auth): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.tasksRepository.createQueryBuilder('task');
    query.where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    let tasks: Task[] = [];
    try {
      tasks = await query.getMany();
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user "${user.username}", Filter: ${filterDto}: ${error.stack}`,
      );
      throw new InternalServerErrorException();
    }

    return tasks;
  }

  async getTaskById(id: string, user: Auth): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id, user } });
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  async createTask(createTaskDto: CreateTaskDto, user: Auth): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.tasksRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });
    await this.tasksRepository.save(task);
    return task;
  }
  async deleteTask(id: string, user: Auth): Promise<void> {
    const result = await this.tasksRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: Auth,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;

    await this.tasksRepository.save(task);
    return task;
  }
}
