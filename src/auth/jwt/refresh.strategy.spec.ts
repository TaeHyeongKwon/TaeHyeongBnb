import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { Payload } from './jwt.payload.interface';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshStrategy } from './refresh.strategy';

const mockAuthService = {
  tokenValidateUser: jest.fn(),
};

describe('AccessStrategy', () => {
  let refreshStrategy: RefreshStrategy;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    refreshStrategy = moduleRef.get<RefreshStrategy>(RefreshStrategy);
  });

  it('should be defined', () => {
    expect(refreshStrategy).toBeDefined();
  });

  it('인증 후 유저 정보 반환 성공 케이스', async () => {
    const testPayLoad: Payload = {
      id: expect.any(Number),
      nickname: expect.any(String),
    };

    const done = jest.fn((x, y) => y);

    const user = {
      id: expect.any(Number),
      nickname: expect.any(String),
      host_certification: expect.any(Boolean),
    };

    mockAuthService.tokenValidateUser = jest.fn().mockReturnValue(user);

    const result = await refreshStrategy.validate(testPayLoad, done);

    expect(result).toEqual(user);
  });

  it('인증 후 유저 정보 반환 실패 케이스', async () => {
    const testPayLoad: Payload = {
      id: expect.any(Number),
      nickname: expect.any(String),
    };

    mockAuthService.tokenValidateUser = jest.fn().mockReturnValue(undefined);

    const done = jest.fn();

    try {
      await refreshStrategy.validate(testPayLoad, done);
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException);
      expect(e).toBeCalledWith({ message: '존재 하지 않는 유저' });
    }
  });

  describe('RefreshStrategy의 상속 함수 테스트', () => {
    let ParentOriginal;
    let parentMock;

    beforeEach(async () => {
      //기존 프로퍼티를 변수에 담고
      ParentOriginal = Object.getPrototypeOf(RefreshStrategy);
      parentMock = jest.fn();
      //mocking한 프로퍼티로 교체
      Object.setPrototypeOf(RefreshStrategy, parentMock);

      const mockAuthService = {} as unknown as AuthService;
      new RefreshStrategy(mockAuthService);
    });

    afterEach(() => {
      //다시 기존 프로퍼티로 변경
      Object.setPrototypeOf(RefreshStrategy, ParentOriginal);
    });

    it('상속 함수 테스트', () => {
      expect(parentMock.mock.calls.length).toBe(1);

      expect(parentMock.mock.calls[0][0].jwtFromRequest).toBeDefined();
      expect(parentMock.mock.calls[0][0].ignoreExpiration).toBeFalsy();
      expect(parentMock.mock.calls[0][0].secretOrKey).toEqual(
        'testRefreshSecretKey',
      );
    });

    it('jwtFromRequest 함수가 올바르게 동작하는지 확인', () => {
      const mockReq = {
        cookies: { refresh: 'testRefreshToken' },
      } as unknown as Request;
      // req?.cookies?.refresh 의 옵셔널 설정에 의한 req가 없는경우, cookie가없는 경우를 추가 검증
      const mockReqNoCookie = {} as unknown as Request;

      const jwtFromRequestFunction = parentMock.mock.calls[0][0].jwtFromRequest;

      const result = jwtFromRequestFunction(mockReq);
      const resultNoCookie = jwtFromRequestFunction(mockReqNoCookie);
      const resultNoReq = jwtFromRequestFunction(undefined);

      expect(result).toEqual('testRefreshToken');
      expect(resultNoCookie).toBeUndefined();
      expect(resultNoReq).toBeUndefined();
    });
  });
});
