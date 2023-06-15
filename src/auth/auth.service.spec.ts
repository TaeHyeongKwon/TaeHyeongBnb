import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { AuthenticationService } from './authentication.service';
import { MailerService } from '@nestjs-modules/mailer';
import { SignUpDto } from './dto/signup.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Payload } from './jwt/jwt.payload.interface';

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
});
