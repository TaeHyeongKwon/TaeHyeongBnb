import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Authentication } from '../entities/authentication.entity';

describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService;

  const mockAuthenticationRepositoty = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: getRepositoryToken(Authentication),
          useValue: mockAuthenticationRepositoty,
        },
      ],
    }).compile();

    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
  });

  it('should be defined', () => {
    expect(authenticationService).toBeDefined();
  });

  it('인증 정보 조회 성공 케이스', async () => {
    mockAuthenticationRepositoty.findOne = jest.fn(() => {
      return 'findOne result';
    });

    const result = await authenticationService.findByFileds(expect.any(Object));

    expect(result).toEqual('findOne result');
  });

  it('인증 코드와 시간 저장 성공 케이스', async () => {
    const code = 'te12st';
    const createdAt = new Date();
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);

    mockAuthenticationRepositoty.create = jest.fn(() => {
      return { code, createdAt, expiration };
    });

    const result = await authenticationService.saveAuthenticationCode(code);

    expect(result).toEqual({ msg: '발송완료' });
    expect(mockAuthenticationRepositoty.create).toHaveBeenCalledTimes(1);
    expect(mockAuthenticationRepositoty.save).toHaveBeenCalledTimes(1);
  });

  it('만료시간이 지난 데이터 삭제 성공 케이스', async () => {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() - 2);

    const existExpiredCodeDate = [{ expiration }];

    mockAuthenticationRepositoty.find = jest.fn(() => {
      return existExpiredCodeDate;
    });

    await authenticationService.deleteExpiredCodeAuto();

    expect(mockAuthenticationRepositoty.find).toBeCalledTimes(1);
    expect(mockAuthenticationRepositoty.delete).toBeCalledTimes(1);
  });
});
