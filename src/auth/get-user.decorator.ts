import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Auth } from './entities/auth.entity';

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): Auth => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
