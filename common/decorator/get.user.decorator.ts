import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '../../src/entities/user.entity';
import { Manager } from 'src/entities/manager.entity';

export const GetUser = createParamDecorator(
  (data, context: ExecutionContext): User | Manager => {
    const req = context.switchToHttp().getRequest();
    return req.user;
  },
);
