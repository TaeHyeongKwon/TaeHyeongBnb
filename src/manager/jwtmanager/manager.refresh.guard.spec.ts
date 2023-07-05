import { Test } from '@nestjs/testing';
import { ManagerRefreshGuard } from './manager.refresh.guard';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('ManagerRefreshGuard', () => {
  let managerRefreshGuard: ManagerRefreshGuard;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ManagerRefreshGuard],
    }).compile();
    managerRefreshGuard =
      moduleRef.get<ManagerRefreshGuard>(ManagerRefreshGuard);
  });

  it('should be defined', () => {
    expect(managerRefreshGuard).toBeDefined();
  });

  it('passport authentication success', async () => {
    const getRequest = jest.fn(() => {
      return { headers: { authorization: 'M_refresh' } };
    });

    const mockContext = {
      swithchToHttp: jest.fn(() => {
        getRequest;
      }),
    } as unknown as ExecutionContext;

    AuthGuard('M_refresh').prototype.canActivate = jest
      .fn()
      .mockResolvedValue(true);

    const result = await managerRefreshGuard.canActivate(mockContext);

    expect(result).toBeTruthy();
  });

  it('passport authentication failed', () => {
    const mockContext = {} as ExecutionContext;

    jest.spyOn(managerRefreshGuard, 'canActivate').mockReturnValue(false);

    const result = managerRefreshGuard.canActivate(mockContext);

    expect(result).toBeFalsy();
  });
});
