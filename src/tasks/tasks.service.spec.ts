import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task.enum';
import { TasksService } from './tasks.service';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const mockTasksRepository: () => MockType<Repository<Task>> = jest.fn(() => ({
  findOne: jest.fn(),
}));

const mockUser = {
  username: 'test',
  password: 'test',
  id: 'test',
  tasks: [],
};
describe('TasksService', () => {
  let service: TasksService;
  let repository: MockType<Repository<Task>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useFactory: mockTasksRepository,
        },
      ],
    }).compile();
    service = module.get<TasksService>(TasksService);
    repository = module.get(getRepositoryToken(Task));
  });

  describe('getTasks', () => {
    it('calls TasksService.getTasks and returns the result', async () => {
      const mockTask = {
        id: '1',
        title: 'test',
        description: 'test',
        status: TaskStatus.OPEN,
        user: mockUser,
      };

      jest.spyOn(service, 'getTasks').mockResolvedValue([mockTask]);
      const result = await service.getTasks(null, mockUser);
      expect(result).toEqual([mockTask]);
    });
  });

  describe('getTaskById', () => {
    it('calls TasksService.getTaskById and returns the result', async () => {
      const mockTask = {
        id: '1',
        title: 'test',
        description: 'test',
        status: TaskStatus.OPEN,
        user: mockUser,
      };

      jest.spyOn(service, 'getTaskById').mockResolvedValue(mockTask);
      const result = await service.getTaskById('1', mockUser);
      expect(result).toEqual(mockTask);
    });

    it('calls TaskService.getTaskById and throws an error', async () => {
      jest
        .spyOn(service, 'getTaskById')
        .mockRejectedValue(new NotFoundException());
      await expect(service.getTaskById('1', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
