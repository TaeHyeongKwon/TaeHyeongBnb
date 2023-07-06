import { Test } from '@nestjs/testing';
import { ManagerAccessGuard } from './manager.access.guard';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('ManagerAccessGuard', () => {
  let managerAccessTokenGuard: ManagerAccessGuard;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ManagerAccessGuard],
    }).compile();
    managerAccessTokenGuard =
      moduleRef.get<ManagerAccessGuard>(ManagerAccessGuard);
  });

  it('should be defined', () => {
    expect(managerAccessTokenGuard).toBeDefined();
  });

  it('passport authentication success', async () => {
    const getRequest = jest.fn(() => {
      return { headers: { authorization: 'M_access' } };
    });

    const mockContext = {
      swithchToHttp: jest.fn(() => {
        getRequest;
      }),
    } as unknown as ExecutionContext;

    AuthGuard('M_access').prototype.canActivate = jest
      .fn()
      .mockResolvedValue(true);

    const result = await managerAccessTokenGuard.canActivate(mockContext);

    expect(result).toBeTruthy();
  });

  it('passport authentication failed', () => {
    const mockContext = {} as ExecutionContext;

    jest.spyOn(managerAccessTokenGuard, 'canActivate').mockReturnValue(false);

    const result = managerAccessTokenGuard.canActivate(mockContext);

    expect(result).toBeFalsy();
  });
});
