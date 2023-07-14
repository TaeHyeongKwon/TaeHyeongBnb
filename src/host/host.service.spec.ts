import { Test, TestingModule } from '@nestjs/testing';
import { HostService } from './host.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Host } from '../entities/host.entity';
import { DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateHostDto } from './dto/create-host.dto';
import {
  BadRequestException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { SendSmsDto } from './dto/send-sms.dto';
import { AxiosResponse } from 'axios';
import { Observable, of } from 'rxjs';
import { CheckSmsDto } from './dto/check-sms.dto';
import { GetHostListDto } from './dto/get-hostlist.dto';
import { User } from '../entities/user.entity';

jest.mock('crypto-js', () => ({
  HmacSHA256: jest.fn().mockReturnValue(['wordArray In crypto-js']),
  enc: {
    Base64: jest.fn(),
  },
}));

describe('HostService', () => {
  let hostService: HostService;

  const mockHostRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  };

  const mockQueryRunner = {
    manager: { save: jest.fn(), update: jest.fn() },
    connect: jest.fn(),
    commitTransaction: jest.fn(),
    startTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => {
      return mockQueryRunner;
    }),
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockCacheManager = {
    del: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HostService,
        { provide: getRepositoryToken(Host), useValue: mockHostRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: HttpService, useValue: mockHttpService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    hostService = module.get<HostService>(HostService);
  });

  it('should be defined', () => {
    expect(hostService).toBeDefined();
  });

  describe('createHost', () => {
    const userId = expect.any(Number);
    const createHostDto: CreateHostDto = {
      name: expect.any(String),
      birth_date: expect.any(String),
      phone_number: expect.any(String),
    };

    it('createHost success case', async () => {
      mockHostRepository.findOne.mockResolvedValue(undefined);

      mockHostRepository.create.mockResolvedValue({ userId });

      await hostService.createHost(userId, createHostDto);

      expect(mockDataSource.createQueryRunner).toBeCalledTimes(1);
      expect(mockQueryRunner.connect).toBeCalledTimes(1);
      expect(mockQueryRunner.startTransaction).toBeCalledTimes(1);
      expect(mockHostRepository.findOne).toBeCalledTimes(1);
      expect(mockHostRepository.create).toBeCalledTimes(1);
      expect(mockQueryRunner.manager.save).toBeCalledTimes(1);
      expect(mockQueryRunner.manager.update).toBeCalledTimes(1);
      expect(mockQueryRunner.commitTransaction).toBeCalledTimes(1);
      expect(mockQueryRunner.release).toBeCalledTimes(1);
    });

    it('if host registration information exists', async () => {
      mockHostRepository.findOne.mockResolvedValue('exist hostData');

      try {
        await hostService.createHost(userId, createHostDto);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toEqual('호스트 등록 트랜잭션 롤백 에러');
      }
    });
  });

  describe('createRandomNum', () => {
    it('createRandomNum success case', () => {
      const result = hostService.createRandomNum();

      expect(result).toBeGreaterThanOrEqual(100000);
      expect(result).toBeLessThanOrEqual(999999);
    });
  });

  describe('makeSignature', () => {
    it('makeSignature success case', () => {
      const timestamp = Date.now().toString();
      const result = hostService.makeSignature(timestamp);
      expect(result).toBeTruthy();
      expect(typeof result).toEqual('string');
    });
  });

  describe('sendSms', () => {
    const sendSmsDto: SendSmsDto = {
      phone_number: expect.any(String),
    };
    it('sendSms success case', async () => {
      const mockAxiosResponse = {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as unknown as Observable<AxiosResponse>;

      mockHttpService.post.mockReturnValue(of(mockAxiosResponse));

      jest
        .spyOn(hostService, 'makeSignature')
        .mockReturnValue('test signature');

      jest.spyOn(hostService, 'createRandomNum').mockReturnValue(123456);

      await hostService.sendSms(sendSmsDto);

      expect(mockCacheManager.del).toBeCalledTimes(1);
      expect(mockCacheManager.del).toBeCalledWith('BnbPhoneNumberCheckCode');
      expect(mockCacheManager.set).toBeCalledTimes(1);
      expect(mockCacheManager.set).toBeCalledWith(
        'BnbPhoneNumberCheckCode',
        '123456',
        180000,
      );
    });

    it('axios post method fail case in sendSms', async () => {
      mockHttpService.post.mockReturnValue(undefined);
      try {
        await hostService.sendSms(sendSmsDto);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toEqual('네이버 SENS SMS전송 axios 에러');
      }
    });
  });

  describe('checkSms', () => {
    const checkSmsDto: CheckSmsDto = {
      checkCode: '123456',
    };
    it('checkSms success case', async () => {
      mockCacheManager.get.mockResolvedValue('123456');

      const result = await hostService.checkSms(checkSmsDto);

      expect(mockCacheManager.get).toBeCalledTimes(1);
      expect(mockCacheManager.get).toBeCalledWith('BnbPhoneNumberCheckCode');
      expect(result).toEqual(true);
    });

    it('if the codes do not match', async () => {
      mockCacheManager.get.mockResolvedValue('987654');
      try {
        await hostService.checkSms(checkSmsDto);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('인증 코드가 일치하지 않습니다.');
      }
    });
  });

  describe('getHostList', () => {
    const getHostListDto: GetHostListDto = {
      page: expect.any(Number),
    };
    it('getHostList success case', async () => {
      mockHostRepository.find.mockResolvedValue('find result');
      const result = await hostService.getHostList(getHostListDto);

      expect(result).toEqual('find result');
      expect(mockHostRepository.find).toBeCalledWith({
        order: { id: 'DESC' },
        skip: 20 * (Number(getHostListDto.page) - 1),
        take: 20,
      });
    });
  });

  describe('updateHostApproval', () => {
    const id = expect.any(Number);
    const userId = expect.any(Number);
    it('updateHostApproval success case', async () => {
      mockHostRepository.findOne.mockResolvedValue({
        userId,
      });

      const result = await hostService.updateHostApproval(id);

      expect(result).toEqual({ msg: '승인 완료' });
      expect(mockDataSource.createQueryRunner).toBeCalledTimes(1);
      expect(mockQueryRunner.connect).toBeCalledTimes(1);
      expect(mockQueryRunner.startTransaction).toBeCalledTimes(1);
      expect(mockQueryRunner.manager.update).toBeCalledTimes(2);
      expect(mockQueryRunner.manager.update).toHaveBeenNthCalledWith(
        1,
        Host,
        { id },
        { approval: true },
      );
      expect(mockQueryRunner.manager.update).toHaveBeenNthCalledWith(
        2,
        User,
        { id: userId },
        { host_certification: true },
      );
      expect(mockQueryRunner.commitTransaction).toBeCalledTimes(1);
      expect(mockQueryRunner.release).toBeCalledTimes(1);
    });

    it('if host data does not exist', async () => {
      mockHostRepository.findOne.mockResolvedValue(undefined);
      try {
        await hostService.updateHostApproval(id);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual('존재하지 않는 호스트 신청');
      }
    });

    it('if a transaction error occurs', async () => {
      mockHostRepository.findOne.mockResolvedValue({
        userId,
      });
      mockQueryRunner.manager.update.mockImplementation(() => {
        throw new Error();
      });

      try {
        await hostService.updateHostApproval(id);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toEqual('호스트 인증 트랜잭션 롤백 에러');
      }
    });
  });
});
