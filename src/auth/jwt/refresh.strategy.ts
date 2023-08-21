import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Payload } from './jwt.payload.interface';
import { Request } from 'express';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private authService: AuthService) {
    super({
      //쿠키의 리프레시 토큰 검증
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.refresh;
        },
      ]),
      ignoreExpiration: false,
      // 리프레시 토큰 비밀키
      secretOrKey: process.env.REFRESH_JWT_SECRET || 'testRefreshSecretKey',
    });
  }

  async validate(payload: Payload, done: VerifiedCallback) {
    const user = await this.authService.tokenValidateUser(payload);
    if (!user) {
      return done(
        new UnauthorizedException({ message: '존재 하지 않는 유저' }),
        false,
      );
    }
    return done(null, user);
  }
}
