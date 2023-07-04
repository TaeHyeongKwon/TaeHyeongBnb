import { Test, TestingModule } from '@nestjs/testing';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';
import { ManagerSignUpDto } from './dto/manager.signup.dto';

describe('ManagerController', () => {
  let managerController: ManagerController;

  const mockManagerService = {
    managerSignUp: jest.fn(),
  };

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

  describe('managerSignUp', () => {
    it('managerSignUp success case', async () => {
      const managerSignUpDto: ManagerSignUpDto = {
        email: expect.any(String),
        password: expect.any(String),
        name: expect.any(String),
        department: expect.any(String),
        position: expect.any(String),
      };

      mockManagerService.managerSignUp.mockResolvedValue('signup result');

      const result = await managerController.managerSignUp(managerSignUpDto);

      expect(result).toEqual('signup result');
      expect(mockManagerService.managerSignUp).toBeCalledTimes(1);
    });
  });
});
