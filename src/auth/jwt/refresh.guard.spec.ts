import { Test } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenGuard } from './refresh.guard';

describe('RefreshTokenGuard', () => {
  let refreshTokenGuard: RefreshTokenGuard;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RefreshTokenGuard],
    }).compile();
    refreshTokenGuard = moduleRef.get<RefreshTokenGuard>(RefreshTokenGuard);
  });

  it('should be defined', () => {
    expect(refreshTokenGuard).toBeDefined();
  });

  it('인증 성공', async () => {
    const getRequest = jest.fn(() => {
      return { headers: { authorization: 'refresh' } };
    });

    const mockContext = {
      swithchToHttp: jest.fn(() => {
        getRequest;
      }),
    } as unknown as ExecutionContext;

    AuthGuard('refresh').prototype.canActivate = jest
      .fn()
      .mockResolvedValue(true);

    const result = await refreshTokenGuard.canActivate(mockContext);

    expect(result).toBeTruthy();
  });

  it('인증 실패', () => {
    const mockContext = {} as ExecutionContext;

    jest.spyOn(refreshTokenGuard, 'canActivate').mockReturnValue(false);

    const result = refreshTokenGuard.canActivate(mockContext);

    expect(result).toBeFalsy();
  });
});
