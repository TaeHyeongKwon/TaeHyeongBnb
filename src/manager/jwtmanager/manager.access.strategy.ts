import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { ManagerTokenPayload } from './m.jwt.payload.interface';
import { ManagerService } from '../manager.service';

@Injectable()
export class ManagerAccessStrategy extends PassportStrategy(
  Strategy,
  'M_access',
) {
  constructor(private managerService: ManagerService) {
    super({
      //AuthHeader의 엑세스토큰을 검증
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      //엑세스토큰 검증 비밀키
      secretOrKey: process.env.M_ACCESS_SECRET,
    });
  }

  async validate(
    payload: ManagerTokenPayload,
    done: VerifiedCallback,
  ): Promise<any> {
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
