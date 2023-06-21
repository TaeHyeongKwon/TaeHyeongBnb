import { Test } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { AccessTokenGuard } from './access.guard';
import { AuthGuard } from '@nestjs/passport';

describe('AccessTokenGuard', () => {
  let accessTokenGuard: AccessTokenGuard;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AccessTokenGuard],
    }).compile();
    accessTokenGuard = moduleRef.get<AccessTokenGuard>(AccessTokenGuard);
  });

  it('should be defined', () => {
    expect(accessTokenGuard).toBeDefined();
  });

  it('인증 성공', async () => {
    const getRequest = jest.fn(() => {
      return { headers: { authorization: 'access' } };
    });

    const mockContext = {
      swithchToHttp: jest.fn(() => {
        getRequest;
      }),
    } as unknown as ExecutionContext;

    AuthGuard('access').prototype.canActivate = jest
      .fn()
      .mockResolvedValue(true);

    const result = await accessTokenGuard.canActivate(mockContext);

    expect(result).toBeTruthy();
  });

  it('인증 실패', () => {
    const mockContext = {} as ExecutionContext;

    jest.spyOn(accessTokenGuard, 'canActivate').mockReturnValue(false);

    const result = accessTokenGuard.canActivate(mockContext);

    expect(result).toBeFalsy();
  });
});
