import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Payload } from './jwt.payload.interface';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(private authService: AuthService) {
    super({
      //AuthHeader의 엑세스토큰을 검증
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      //엑세스토큰 검증 비밀키
      secretOrKey: process.env.ACCESS_JWT_SECRET || 'testAccessSecretKey',
    });
  }

  async validate(payload: Payload, done: VerifiedCallback): Promise<any> {
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
