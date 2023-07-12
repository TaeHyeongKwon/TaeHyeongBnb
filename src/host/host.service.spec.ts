import { Test, TestingModule } from '@nestjs/testing';
import { HostService } from './host.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Host } from '../entities/host.entity';
import { DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('HostService', () => {
  let hostService: HostService;

  const mockHostRepository = {};

  const mockDataSource = {};

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
});
