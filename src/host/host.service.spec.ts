import { Test, TestingModule } from '@nestjs/testing';
import { HostService } from './host.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Host } from '../entities/host.entity';
import { DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateHostDto } from './dto/create-host.dto';
import { HttpException } from '@nestjs/common';

describe('HostService', () => {
  let hostService: HostService;

  const mockHostRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
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

  const mockHttpService = {};

  const mockCacheManager = {};

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
});
