import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { Payload } from './jwt/jwt.payload.interface';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { HttpService } from '@nestjs/axios';
// import axios from 'axios';
import { firstValueFrom } from 'rxjs';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Authentication } from '../entities/authentication.entity';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Authentication)
    private authenticationRepository: Repository<Authentication>,
    private userService: UserService,
    private jwtService: JwtService,
    private http: HttpService,
    private mailerService: MailerService,
  ) {}

  //회원가입
  async register(userInfo: SignUpDto): Promise<User> {
    //이메일 및 닉네임 중복확인
    const existNickname = await this.userService.findByFields({
      where: { nickname: userInfo.nickname },
    });

    const existEmail = await this.userService.findByFields({
      where: { email: userInfo.email },
    });
    if (!userInfo.password) throw new BadRequestException('비밀번호 입력 필요');

    if (existNickname) throw new ConflictException('중복 닉네임');

    if (existEmail) throw new ConflictException('중복 이메일');

    //중복 확인 이후 유저 정보저장
    return await this.userService.saveUserInfo(userInfo);
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
      throw new BadRequestException('password를 확인해 주세요');

    //토큰에 넣어줄 정보 선언
    const payload: Payload = { id: existUser.id, nickname: existUser.nickname };

    // accessToken 발급
    const accessToken = await this.createAccessToken(payload);
    // refreshToken 발급
    const refreshToken = await this.createRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  async tokenValidateUser(payload: Payload): Promise<User | undefined> {
    return await this.userService.findById(payload.id);
  }

  //카카오 로그인
  async kakaoLogin(apikey: string, redirectUri: string, code: string) {
    const config = {
      grant_type: 'authorization_code',
      client_id: apikey,
      redirect_uri: redirectUri,
      code,
    };
    const params = new URLSearchParams(config).toString();
    const tokenUrl = `https://kauth.kakao.com/oauth/token?${params}`;
    const tokenHeaders = {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    //kakao에 토큰 요청
    const res = await firstValueFrom(
      this.http.post(tokenUrl, '', { headers: tokenHeaders }),
    );
    // 위 방법 이 외의 axios 요청방법 3가지
    // const res = await firstValueFrom(
    // this.http.post(tokenUrl, params, { headers: tokenHeaders }),
    // );

    // const res = await this.http.post(tokenUrl, params, { headers: tokenHeaders }).toPromise()

    // await axios.post(tokenUrl, params, { headers: tokenHeaders }).then((res) => {
    //   console.log(res.data);
    // });

    //받은 토큰으로 회원정보 요청
    const userInfoUrl = `https://kapi.kakao.com/v2/user/me`;
    const userInfoHeaders = {
      Authorization: `Bearer ${res.data.access_token}`,
    };
    const { data } = await firstValueFrom(
      this.http.get(userInfoUrl, { headers: userInfoHeaders }),
    );

    const kakaoUserInfo = {
      email: data.kakao_account.email,
      nickname: data.kakao_account.profile.nickname,
      registration_path: 'kakao',
    };
    //받은 회원정보를 우리 DB에서 확인
    const existKakaoUser = await this.userService.findByFields({
      where: {
        email: kakaoUserInfo.email,
        registration_path: 'kakao',
      },
    });

    let payload: Payload = { id: null, nickname: '' };

    //없으면 저장 후, 있으면 바로 토큰 발급
    if (!existKakaoUser) {
      const existUser = await this.userService.saveUserInfo(kakaoUserInfo);
      payload = { id: existUser.id, nickname: existUser.nickname };
    } else {
      payload = { id: existKakaoUser.id, nickname: existKakaoUser.nickname };
    }
    const accessToken = await this.createAccessToken(payload);
    const refreshToken = await this.createRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  //이메일 인증코드 생성
  async createEmailCode() {
    return uuidv4().substring(0, 6);
  }

  //이메일 인증코드 전송 및 DB에 저장
  async sendEmailAuthentication(email: string) {
    //인증코드 생성
    const code = await this.createEmailCode();

    //인증코드 메일 전송
    await this.mailerService.sendMail({
      to: email,
      subject: 'TaeHyeongBNB 이메일 인증코드',
      text: `TaeHyeongBNB 이메일 인증코드는

      ${code} 
      
      입니다.`,
    });

    //인증코드와 시간을 DB에 저장
    const createdAt = new Date();
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);

    const emailAuthentication = this.authenticationRepository.create({
      code,
      createdAt,
      expiration,
    });

    await this.authenticationRepository.save(emailAuthentication);

    return { msg: '발송완료' };
  }
}
