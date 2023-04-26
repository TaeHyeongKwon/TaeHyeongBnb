import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('refresh') {
  canActivate(context: ExecutionContext): any {
    return super.canActivate(context);
  }
}
