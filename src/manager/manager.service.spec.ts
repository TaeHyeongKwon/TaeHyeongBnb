import { Test, TestingModule } from '@nestjs/testing';
import { ManagerService } from './manager.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Manager } from '../entities/manager.entity';
import { JwtService } from '@nestjs/jwt';

describe('ManagerService', () => {
  let managerService: ManagerService;

  const mockManagerRepository = {};

  const mockJwtService = {};

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagerService,
        {
          provide: getRepositoryToken(Manager),
          useValue: mockManagerRepository,
        },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    managerService = module.get<ManagerService>(ManagerService);
  });

  it('should be defined', () => {
    expect(managerService).toBeDefined();
  });
});
