import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessTokenGuard extends AuthGuard('access') {
  canActivate(context: ExecutionContext): any {
    return super.canActivate(context);
  }
}
