import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { Request } from 'express';
import { ManagerService } from '../manager.service';
import { ManagerTokenPayload } from './m.jwt.payload.interface';

@Injectable()
export class ManagerRefreshStrategy extends PassportStrategy(
  Strategy,
  'M_refresh',
) {
  constructor(private managerService: ManagerService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.refresh;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.M_REFRESH_SECRET,
    });
  }

  async validate(payload: ManagerTokenPayload, done: VerifiedCallback) {
    const manager = await this.managerService.tokenValidateManager(payload);
    if (!manager) {
      return done(
        new UnauthorizedException({ message: '존재 하지 않는 관리자' }),
        false,
      );
    }
    return done(null, manager);
  }
}
