import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ManagerRefreshGuard extends AuthGuard('M_refresh') {
  canActivate(context: ExecutionContext): any {
    return super.canActivate(context);
  }
}
