import { Test, TestingModule } from '@nestjs/testing';
import { ManagerService } from '../manager.service';
import { ManagerRefreshStrategy } from './manager.refresh.strategy';
import { ManagerTokenPayload } from './m.jwt.payload.interface';
import { UnauthorizedException } from '@nestjs/common';

describe('ManagerRefreshStrategy', () => {
  let managerRefreshStrategy: ManagerRefreshStrategy;

  const mockManagerService = {
    tokenValidateManager: jest.fn(),
  } as unknown as ManagerService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ManagerRefreshStrategy,
        { provide: ManagerService, useValue: mockManagerService },
      ],
    }).compile();

    managerRefreshStrategy = moduleRef.get<ManagerRefreshStrategy>(
      ManagerRefreshStrategy,
    );
  });

  it('should be defined', () => {
    expect(managerRefreshStrategy).toBeDefined();
  });

  describe('ManagerRefreshStrategy(call supper)', () => {
    let ParentOriginal;
    let parentMock;

    beforeEach(async () => {
      ParentOriginal = Object.getPrototypeOf(ManagerRefreshStrategy);
      parentMock = jest.fn();
      Object.setPrototypeOf(ManagerRefreshStrategy, parentMock);

      new ManagerRefreshStrategy(mockManagerService);
    });

    afterEach(() => {
      Object.setPrototypeOf(ManagerRefreshStrategy, ParentOriginal);
    });

    it('test (call supper)', () => {
      expect(parentMock.mock.calls.length).toBe(1);

      expect(parentMock.mock.calls[0][0].jwtFromRequest).toBeDefined();
      expect(parentMock.mock.calls[0][0].ignoreExpiration).toBeFalsy();
      expect(parentMock.mock.calls[0][0].secretOrKey).toEqual(
        'testManagerRefresh',
      );
    });

    it('jwtFromRequest success', () => {
      const mockRequest = {
        cookies: { refresh: 'testManagerRefresh' },
      } as unknown as Request;
      const mockReqNoCookie = {} as unknown as Request;

      const jwtFromRequestFunction = parentMock.mock.calls[0][0].jwtFromRequest;

      const result = jwtFromRequestFunction(mockRequest);
      const resultNoCookie = jwtFromRequestFunction(mockReqNoCookie);
      const resultNoReq = jwtFromRequestFunction(undefined);

      expect(result).toEqual('testManagerRefresh');
      expect(resultNoCookie).toBeUndefined();
      expect(resultNoReq).toBeUndefined();
    });
  });

  describe('validate', () => {
    const testPayLoad: ManagerTokenPayload = {
      id: expect.any(Number),
      name: expect.any(String),
    };
    const done = jest.fn((x, y) => y);

    it('validate success case', async () => {
      const manager = {
        id: expect.any(Number),
        nickname: expect.any(String),
      };

      mockManagerService.tokenValidateManager = jest
        .fn()
        .mockResolvedValue(manager);

      const result = await managerRefreshStrategy.validate(testPayLoad, done);

      expect(result).toEqual(manager);
    });

    it('manager does not exist in validate', async () => {
      mockManagerService.tokenValidateManager = jest
        .fn()
        .mockResolvedValue(undefined);

      try {
        await managerRefreshStrategy.validate(testPayLoad, done);
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e).toBeCalledWith({ message: '존재 하지 않는 관리자' });
      }
    });
  });
});
