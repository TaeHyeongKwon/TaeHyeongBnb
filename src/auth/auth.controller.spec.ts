import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';

//테스트케이스 'AuthController
describe('AuthController', () => {
  let authController: AuthController;

  //mockAuthService로 의존성 대체
  const mockAuthService = {
    register: jest.fn(),
  };

  const mockResponse: Response = {
    json: jest.fn(),
  } as unknown as Response;

  //각 테스트가 실행되기 이전 수행될 내용
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('회원가입 성공 case', async () => {
    const result = await authController.register(
      {
        email: 'abcd@naver.com',
        nickname: 'backend1313',
        password: 'backend1234',
      },
      mockResponse,
    );

    expect(result).toEqual({
      id: expect.any(Number),
      email: 'abcd@naver.com',
      nickname: 'backend1313',
      password: 'backend123',
    });
  });
});
