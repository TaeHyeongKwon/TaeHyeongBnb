import { Test, TestingModule } from '@nestjs/testing';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';

describe('ManagerController', () => {
  let managerController: ManagerController;

  const mockManagerService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManagerController],
      providers: [{ provide: ManagerService, useValue: mockManagerService }],
    }).compile();

    managerController = module.get<ManagerController>(ManagerController);
  });

  it('should be defined', () => {
    expect(managerController).toBeDefined();
  });
});
