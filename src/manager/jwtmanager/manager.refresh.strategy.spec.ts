import { Test, TestingModule } from '@nestjs/testing';
import { ManagerService } from '../manager.service';
import { ManagerRefreshStrategy } from './manager.refresh.strategy';

describe('ManagerRefreshStrategy', () => {
  let managerRefreshStrategy: ManagerRefreshStrategy;

  const mockManagerService = {};

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ManagerRefreshStrategy,
        { provide: ManagerService, useValue: mockManagerService },
      ],
    }).compile();

    managerRefreshStrategy = moduleRef.get<ManagerRefreshStrategy>(
      ManagerRefreshStrategy,
    );
  });

  it('should be defined', () => {
    expect(managerRefreshStrategy).toBeDefined();
  });
});
