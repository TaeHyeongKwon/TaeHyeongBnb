import { Test, TestingModule } from '@nestjs/testing';
import { HostController } from './host.controller';
import { HostService } from './host.service';

describe('HostController', () => {
  let hostController: HostController;

  const mockHostService = {};

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HostController],
      providers: [{ provide: HostService, useValue: mockHostService }],
    }).compile();

    hostController = module.get<HostController>(HostController);
  });

  it('should be defined', () => {
    expect(hostController).toBeDefined();
  });
});
