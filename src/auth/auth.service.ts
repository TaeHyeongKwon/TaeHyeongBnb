import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { Payload } from './jwt/jwt.payload.interface';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  //회원가입
  async register(userInfo: SignUpDto): Promise<SignUpDto> {
    //이메일 및 닉네임 중복확인
    const existNickname = await this.userService.findByFields({
      where: { nickname: userInfo.nickname },
    });

    const existEmail = await this.userService.findByFields({
      where: { email: userInfo.email },
    });

    if (existNickname) throw new ConflictException('중복 닉네임');

    if (existEmail) throw new ConflictException('중복 이메일');

    //중복 확인 이후 유저 정보저장
    return await this.userService.saveUserInfo(userInfo);
  }

  //로그인
  async validateUser(
    userInfo: LoginDto,
  ): Promise<{ accessToken; refreshToken } | undefined> {
    //해당 email과 일치하는 데이터를 조회
    const existUser: User = await this.userService.findByFields({
      where: { email: userInfo.email },
    });

    //email과 같은 데이터가 없을 시 에러
    if (!existUser) throw new NotFoundException('email을 확인 해주세요');

    //비밀번호 검증
    const validatePassword = await bcrypt.compare(
      userInfo.password,
      existUser.password,
    );

    //비밀번호 불일치 시 에러
    if (!validatePassword)
      throw new UnauthorizedException('password를 확인해 주세요');

    //토큰에 넣어줄 정보 선언
    const payload: Payload = { id: existUser.id, nickname: existUser.nickname };

    // accessToken 발급
    const accessToken = await this.createAccessToken(payload);
    // refreshToken 발급
    const refreshToken = await this.createRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  //엑세스 토큰 생성
  async createAccessToken(payload: Payload): Promise<string> {
    const accessToken = await this.jwtService.sign(payload, {
      secret: process.env.ACCESS_JWT_SECRET,
      expiresIn: '5m',
    });
    return accessToken;
  }
  //리프레쉬 토큰 생성
  async createRefreshToken(payload: Payload): Promise<string> {
    const refreshToken = await this.jwtService.sign(payload, {
      secret: process.env.REFRESH_JWT_SECRET,
      expiresIn: '24h',
    });
    return refreshToken;
  }

  async tokenValidateUser(payload: Payload): Promise<User | undefined> {
    return await this.userService.findById(payload.id);
  }
}
