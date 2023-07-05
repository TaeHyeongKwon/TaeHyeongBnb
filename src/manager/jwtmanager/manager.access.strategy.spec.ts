import { Test, TestingModule } from '@nestjs/testing';
import { ManagerAccessStrategy } from './manager.access.strategy';
import { ManagerService } from '../manager.service';
import { ManagerTokenPayload } from './m.jwt.payload.interface';
import { Manager } from '../../entities/manager.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('ManagerAccessStrategy', () => {
  let managerAccessStrategy: ManagerAccessStrategy;

  const mockManagerService = {
    tokenValidateManager: jest.fn(),
  } as unknown as ManagerService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ManagerAccessStrategy,
        { provide: ManagerService, useValue: mockManagerService },
      ],
    }).compile();

    managerAccessStrategy = moduleRef.get<ManagerAccessStrategy>(
      ManagerAccessStrategy,
    );
  });

  it('should be defined', () => {
    expect(managerAccessStrategy).toBeDefined();
  });

  describe('ManagerAccessStrategy(call supper)', () => {
    let ParentOriginal;
    let parentMock;

    beforeEach(async () => {
      ParentOriginal = Object.getPrototypeOf(ManagerAccessStrategy);
      parentMock = jest.fn();
      Object.setPrototypeOf(ManagerAccessStrategy, parentMock);

      new ManagerAccessStrategy(mockManagerService);
    });

    afterEach(() => {
      Object.setPrototypeOf(ManagerAccessStrategy, ParentOriginal);
    });

    it('test (call supper)', () => {
      expect(parentMock.mock.calls.length).toBe(1);

      expect(parentMock.mock.calls[0][0].jwtFromRequest).toBeDefined();
      expect(parentMock.mock.calls[0][0].ignoreExpiration).toBeFalsy();
      expect(parentMock.mock.calls[0][0].secretOrKey).toEqual(
        'testManagerAccess',
      );
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
        name: expect.any(String),
      } as Manager;

      mockManagerService.tokenValidateManager = jest
        .fn()
        .mockResolvedValue(manager);

      const result = await managerAccessStrategy.validate(testPayLoad, done);

      expect(result).toEqual(manager);
    });

    it('manager does not exist in validate', async () => {
      mockManagerService.tokenValidateManager = jest
        .fn()
        .mockResolvedValue(undefined);

      try {
        await managerAccessStrategy.validate(testPayLoad, done);
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBeCalledWith({ message: '존재 하지 않는 관리자' });
      }
    });
  });
});
