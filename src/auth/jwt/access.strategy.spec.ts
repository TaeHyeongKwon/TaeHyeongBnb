import { Test, TestingModule } from '@nestjs/testing';
import { AccessStrategy } from './access.strategy';
import { AuthService } from '../auth.service';
import { Payload } from './jwt.payload.interface';
import { UnauthorizedException } from '@nestjs/common';

const mockAuthService = {
  tokenValidateUser: jest.fn(),
};

describe('AccessStrategy', () => {
  let accessStrategy: AccessStrategy;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AccessStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    accessStrategy = moduleRef.get<AccessStrategy>(AccessStrategy);
  });

  it('should be defined', () => {
    expect(accessStrategy).toBeDefined();
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

    const result = await accessStrategy.validate(testPayLoad, done);

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
      await accessStrategy.validate(testPayLoad, done);
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException);
      expect(e).toBeCalledWith({ message: '존재 하지 않는 유저' });
    }
  });

  describe('AccessStrategy의 상속 함수 테스트', () => {
    let ParentOriginal;
    let parentMock;

    beforeEach(async () => {
      ParentOriginal = Object.getPrototypeOf(AccessStrategy);
      parentMock = jest.fn();
      Object.setPrototypeOf(AccessStrategy, parentMock);

      const mockAuthService = {} as unknown as AuthService;
      new AccessStrategy(mockAuthService);
    });

    afterEach(() => {
      Object.setPrototypeOf(AccessStrategy, ParentOriginal);
    });

    it('상속 함수 테스트', () => {
      expect(parentMock.mock.calls.length).toBe(1);

      expect(parentMock.mock.calls[0][0].jwtFromRequest).toBeDefined();
      expect(parentMock.mock.calls[0][0].ignoreExpiration).toBeFalsy();
      expect(parentMock.mock.calls[0][0].secretOrKey).toEqual(
        'testAccessSecretKey',
      );
    });
  });
});
