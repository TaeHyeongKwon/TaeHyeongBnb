import { Test, TestingModule } from '@nestjs/testing';
import { ManagerAccessStrategy } from './manager.access.strategy';
import { ManagerService } from '../manager.service';

describe('ManagerAccessStrategy', () => {
  let managerAccessStrategy: ManagerAccessStrategy;

  const mockManagerService = {};

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ManagerAccessStrategy,
        { provide: ManagerService, useValue: mockManagerService },
      ],
    }).compile();

    managerAccessStrategy = moduleRef.get<ManagerAccessStrategy>(
      ManagerAccessStrategy,
    );
  });

  it('should be defined', () => {
    expect(managerAccessStrategy).toBeDefined();
  });
});
