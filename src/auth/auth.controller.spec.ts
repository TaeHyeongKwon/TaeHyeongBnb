import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { SendEmailDto } from './dto/sendemail.dto';
import { CheckEmailDto } from './dto/checkemail.dto';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    validateUser: jest.fn(),
    createAccessToken: jest.fn(),
    kakaoLogin: jest.fn(),
    sendEmailAuthentication: jest.fn(),
    checkAuthenticationCode: jest.fn(),
  };

  const mockReq = {
    user: { id: expect.any(Number), nickname: expect.any(String) },
  } as unknown as Request;

  const mockRes = {
    json: jest.fn(),
    setHeader: jest.fn(),
    cookie: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('회원가입 성공 케이스', async () => {
    const userInfo: SignUpDto = {
      email: 'abcd@naver.com',
      nickname: 'backend1313',
      password: 'backend1234',
    };

    mockAuthService.register = jest.fn();

    await authController.register(userInfo, mockRes);

    expect(mockAuthService.register).toBeCalledTimes(1);
    expect(mockRes.json).toBeCalledTimes(1);
    expect(mockRes.json).toBeCalledWith({ msg: '회원가입 성공' });
  });

  it('로그인 성공 케이스', async () => {
    const userInfo: LoginDto = { email: 'test@test.com', password: 'testpass' };

    mockAuthService.validateUser = jest
      .fn()
      .mockReturnValue({ accessToken: 'access', refreshToken: 'refresh' });

    await authController.login(userInfo, mockRes);

    const cookieOption = {
      httpOnly: true,
      maxAge: 86400000,
    };

    expect(mockAuthService.validateUser).toBeCalledWith(userInfo);
    expect(mockRes.setHeader).toBeCalledWith('Authorizetion', 'Bearer access');
    expect(mockRes.cookie).toBeCalledWith('refresh', 'refresh', cookieOption);
    expect(mockRes.json).toBeCalledWith({ msg: '로그인 성공' });
  });

  it('엑세스 토큰 재발급 성공 케이스', async () => {
    mockAuthService.createAccessToken = jest.fn(() => {
      return 'access';
    });
    await authController.checkRefresh(mockReq, mockRes);

    expect(mockRes.setHeader).toBeCalledWith('Authorizetion', 'Bearer access');
    expect(mockRes.json).toBeCalledWith({ msg: '토큰 재발급' });
  });

  it('카카오 로그인 페이지 보여주기 성공 케이스', async () => {
    await authController.kakaoRedirect(mockRes);

    expect(mockRes.redirect).toBeCalledTimes(1);
  });

  it('카카오 로그인 성공 케이스', async () => {
    const code = 'vaergbvofptrgj13t5439vnmvdwq';

    mockAuthService.kakaoLogin = jest.fn(() => {
      return { accessToken: 'kakaoAccess', refreshToken: 'kakaoRefresh' };
    });

    await authController.getKakaoInfo(code, mockRes);

    const cookieOption = {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    };

    expect(mockRes.setHeader).toBeCalledWith(
      'Authorizetion',
      `Bearer kakaoAccess`,
    );
    expect(mockRes.cookie).toBeCalledWith(
      'refresh',
      'kakaoRefresh',
      cookieOption,
    );
    expect(mockRes.json).toBeCalledWith({ msg: '로그인 성공' });
  });

  it('이메일 인증 코드 전송 성공 케이스', async () => {
    mockAuthService.sendEmailAuthentication = jest.fn(() => {
      return 'authentication code';
    });

    const sendEmailDto: SendEmailDto = { email: 'test@test.com' };
    const result = await authController.sendEmailAuthentication(sendEmailDto);

    expect(result).toEqual('authentication code');
    expect(mockAuthService.sendEmailAuthentication).toBeCalledTimes(1);
  });

  it('이메일 인증 성공 케이스', async () => {
    mockAuthService.checkAuthenticationCode = jest.fn(() => {
      return 'success authentication';
    });

    const checkEmailDto: CheckEmailDto = { code: 'te12st' };
    const result = await authController.checkAuthenticationCode(checkEmailDto);

    expect(result).toEqual('success authentication');
    expect(mockAuthService.checkAuthenticationCode).toBeCalledTimes(1);
  });
});
