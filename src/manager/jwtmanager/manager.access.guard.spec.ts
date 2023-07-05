import { Test } from '@nestjs/testing';
import { ManagerAccessGuard } from './manager.access.guard';

describe('ManagerAccessGuard', () => {
  let managerAccessTokenGuard: ManagerAccessGuard;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ManagerAccessGuard],
    }).compile();
    managerAccessTokenGuard =
      moduleRef.get<ManagerAccessGuard>(ManagerAccessGuard);
  });

  it('should be defined', () => {
    expect(managerAccessTokenGuard).toBeDefined();
  });
});
