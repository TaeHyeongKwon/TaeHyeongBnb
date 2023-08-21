import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { AuthenticationService } from './authentication.service';
import { MailerService } from '@nestjs-modules/mailer';
import { SignUpDto } from './dto/signup.dto';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Payload } from './jwt/jwt.payload.interface';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { of } from 'rxjs/internal/observable/of';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUserService = {
    findByFields: jest.fn(),
    saveUserInfo: jest.fn(),
    findById: jest.fn(),
  };

  const mockAuthenticationService = {
    saveAuthenticationCode: jest.fn(),
    findByFileds: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        { provide: HttpService, useValue: mockHttpService },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('회원가입 성공 케이스', async () => {
    const userInfo: SignUpDto = {
      email: 'abc@thbnb.com',
      password: 'testpass',
      nickname: 'testnick',
    };

    jest.spyOn(mockUserService, 'findByFields');

    mockUserService.saveUserInfo = jest.fn(() => {
      return 'saveUserInfo result';
    });

    const result = await authService.register(userInfo);
    // mockUserService.saveUserInfo의 결과값과 동일해야 한다.
    expect(result).toBe('saveUserInfo result');
    // register동작 중 findByFields함수는 2번 호출된다.
    expect(mockUserService.findByFields).toHaveBeenCalledTimes(2);
  });

  it('회원가입 비밀번호 미입력 예외 케이스', async () => {
    const userInfo: SignUpDto = {
      email: 'abc@thbnb.com',
      password: 'testpass',
      nickname: 'testnick',
    };
    try {
      await authService.register({
        email: userInfo.email,
        password: undefined,
        nickname: userInfo.nickname,
      });
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toEqual('비밀번호 입력 필요');
    }
  });

  it('회원가입 닉네임 중복 예외 케이스', async () => {
    const userInfo: SignUpDto = {
      email: 'abc@thbnb.com',
      password: 'testpass',
      nickname: 'testnick',
    };

    const user = {
      id: 1,
      email: 'test@test.com',
      password: 'testpass',
      nickname: 'testnick',
    };

    mockUserService.findByFields.mockImplementationOnce(() => user);

    try {
      await authService.register(userInfo);
    } catch (e) {
      expect(e).toBeInstanceOf(ConflictException);
      expect(e.message).toEqual('중복 닉네임');
    }
  });

  it('회원가입 이메일 중복 예외 케이스', async () => {
    const userInfo: SignUpDto = {
      email: 'test@thbnb.com',
      password: 'testpass',
      nickname: 'testnick',
    };

    const user = {
      id: 1,
      email: 'test@test.com',
      password: 'testpass',
      nickname: 'abctestnick',
    };

    mockUserService.findByFields
      .mockImplementationOnce(() => undefined)
      .mockImplementationOnce(() => user);

    try {
      await authService.register(userInfo);
    } catch (e) {
      expect(e).toBeInstanceOf(ConflictException);
      expect(e.message).toEqual('중복 이메일');
    }
  });

  it('엑세스 토큰 생성 성공 케이스', async () => {
    const payload: Payload = { id: 1, nickname: 'testnick' };

    mockJwtService.sign = jest.fn(() => {
      return 'accessToken';
    });

    const result = await authService.createAccessToken(payload);

    expect(result).toBe('accessToken');
    expect(mockJwtService.sign).toBeCalledTimes(1);
  });

  it('리프레시 토큰 생성 성공 케이스', async () => {
    const payload: Payload = { id: 1, nickname: 'testnick' };

    mockJwtService.sign = jest.fn(() => {
      return 'refreshToken';
    });

    const result = await authService.createRefreshToken(payload);

    expect(result).toBe('refreshToken');
    expect(mockJwtService.sign).toBeCalledTimes(1);
  });

  it('로그인 성공 케이스', async () => {
    const user = {
      id: 1,
      email: 'test@test.com',
      password: await bcrypt.hash('testpass', 10),
      nickname: 'testnick',
    };

    const loginDto: LoginDto = { email: 'test@test.com', password: 'testpass' };

    mockUserService.findByFields = jest.fn(() => {
      return user;
    });

    jest
      .spyOn(authService, 'createAccessToken')
      .mockResolvedValue('accessToken');
    jest
      .spyOn(authService, 'createRefreshToken')
      .mockResolvedValue('refreshToken');

    const result = await authService.validateUser(loginDto);

    expect(result).toEqual({
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    });
    expect(mockUserService.findByFields).toBeCalledTimes(1);
    expect(authService.createAccessToken).toBeCalledTimes(1);
    expect(authService.createRefreshToken).toBeCalledTimes(1);
  });

  it('로그인 이메일 불일치 예외 케이스', async () => {
    const loginDto: LoginDto = { email: 'test@test.com', password: 'testpass' };

    mockUserService.findByFields = jest.fn(() => {
      return undefined;
    });

    try {
      await authService.validateUser(loginDto);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
      expect(e.message).toEqual('email을 확인 해주세요');
    }
  });

  it('로그인 비밀번호 불일치시 예외 케이스', async () => {
    const user = {
      id: 1,
      email: 'test@test.com',
      password: await bcrypt.hash('testpass', 10),
      nickname: 'testnick',
    };

    const loginDto: LoginDto = {
      email: 'test@test.com',
      password: 'testfalse',
    };

    mockUserService.findByFields = jest.fn(() => {
      return user;
    });

    try {
      await authService.validateUser(loginDto);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toEqual('password를 확인해 주세요');
    }
  });

  it('토큰 검증시 유저정보 반환 성공 케이스', async () => {
    const payload: Payload = { id: expect.any(Number), nickname: 'testnick' };

    const user = {
      id: expect.any(Number),
      nickname: 'testnick',
      host_certification: true,
    };
    mockUserService.findById = jest.fn(() => {
      return user;
    });
    const result = await authService.tokenValidateUser(payload);

    expect(result).toEqual(user);
  });

  it('DB 존재하는 유저의 카카오 로그인 성공 케이스', async () => {
    const apikey = 'mock-api-key';
    const redirectUri = 'https://mockalhost:4000/auth/kakao';
    const code = 'abvtrwaggtgg#$g33gtyra';

    mockHttpService.post.mockReturnValue(
      of({
        data: { access_token: 'mock-Kakao-Access' },
      }),
    );

    mockHttpService.get.mockReturnValue(
      of({
        data: {
          kakao_account: {
            email: 'test@test.com',
            profile: { nickname: 'testnick' },
          },
        },
      }),
    );

    const user = { email: 'test@kakao.com', registration_path: 'kakao' };

    mockUserService.findByFields = jest.fn(() => {
      return user;
    });

    jest
      .spyOn(authService, 'createAccessToken')
      .mockResolvedValue('accessToken');
    jest
      .spyOn(authService, 'createRefreshToken')
      .mockResolvedValue('refreshToken');

    const result = await authService.kakaoLogin(apikey, redirectUri, code);

    expect(result).toEqual({
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    });
  });

  it('DB 존재하지 않는 유저의 카카오 로그인 성공 케이스', async () => {
    const apikey = 'mock-api-key';
    const redirectUri = 'https://mockalhost:4000/auth/kakao';
    const code = 'abvtrwaggtgg#$g33gtyra';

    mockHttpService.post.mockReturnValue(
      of({
        data: { access_token: 'mock-Kakao-Access' },
      }),
    );

    mockHttpService.get.mockReturnValue(
      of({
        data: {
          kakao_account: {
            email: 'test@test.com',
            profile: { nickname: 'testnick' },
          },
        },
      }),
    );

    mockUserService.findByFields = jest.fn(() => {
      return undefined;
    });

    const user = {
      id: expect.any(Number),
      email: 'test@test.com',
      nickname: 'testnick',
      registration_path: 'kakao',
    };

    mockUserService.saveUserInfo = jest.fn(() => {
      return user;
    });

    jest
      .spyOn(authService, 'createAccessToken')
      .mockResolvedValue('accessToken');
    jest
      .spyOn(authService, 'createRefreshToken')
      .mockResolvedValue('refreshToken');

    const result = await authService.kakaoLogin(apikey, redirectUri, code);

    expect(result).toEqual({
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    });
  });

  it('이메일 인증코드 생성 성공 케이스', async () => {
    const code = await authService.createEmailCode();

    expect(code.length).toBe(6);
    expect(typeof code).toBe('string');
  });

  it('이메일 인증 코드 전송 및 저장 성공 케이스', async () => {
    const email = 'test@test.com';

    jest.spyOn(authService, 'createEmailCode').mockResolvedValue('te12st');

    mockAuthenticationService.saveAuthenticationCode = jest.fn(() => {
      return 'saveAuthenticationCode result';
    });

    const result = await authService.sendEmailAuthentication(email);

    expect(result).toEqual('saveAuthenticationCode result');
    expect(authService.createEmailCode).toBeCalledTimes(1);
    expect(mockMailerService.sendMail).toBeCalledTimes(1);
  });

  it('이메일 인증 코드 체크 성공 케이스', async () => {
    const code = 'Te12st';
    const createdAt = new Date();
    const expiration = new Date(createdAt.getHours() + 1);

    const existcheckAuthentication = {
      id: expect.any(Number),
      code: 'te12st',
      createdAt,
      expiration,
    };

    mockAuthenticationService.findByFileds = jest.fn(() => {
      return existcheckAuthentication;
    });
    const result = await authService.checkAuthenticationCode(code);

    expect(result).toEqual({ msg: '인증 성공' });
    expect(mockAuthenticationService.findByFileds).toBeCalledTimes(1);
  });

  it('이메일 인증 코드 체크 실패 예외 케이스', async () => {
    const code = 'Te12st';

    mockAuthenticationService.findByFileds = jest.fn(() => {
      return undefined;
    });

    try {
      await authService.checkAuthenticationCode(code);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
      expect(e.message).toEqual('인증 정보 없음');
    }
  });
});
