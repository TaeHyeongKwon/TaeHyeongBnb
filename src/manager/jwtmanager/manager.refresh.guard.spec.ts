import { Test } from '@nestjs/testing';
import { ManagerRefreshGuard } from './manager.refresh.guard';

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
});
