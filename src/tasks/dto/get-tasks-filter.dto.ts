import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../task.model';

export class GetTasksFilterDto {
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsNotEmpty()
  search?: string;
}
