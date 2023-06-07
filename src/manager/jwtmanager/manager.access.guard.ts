import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ManagerAccessGuard extends AuthGuard('M_access') {
  canActivate(context: ExecutionContext): any {
    return super.canActivate(context);
  }
}
