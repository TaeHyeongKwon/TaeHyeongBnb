import { Test, TestingModule } from '@nestjs/testing';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';
import { ManagerSignUpDto } from './dto/manager.signup.dto';
import { Response } from 'express';
import { ManagerLoginDto } from './dto/manager.login.dto';

describe('ManagerController', () => {
  let managerController: ManagerController;

  const mockManagerService = {
    managerSignUp: jest.fn(),
    managerLogin: jest.fn(),
  };

  const mockResponse = {
    setHeader: jest.fn(),
    cookie: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;

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

  describe('managerLogin', () => {
    it('managerLogin success case', async () => {
      const managerLoginDto: ManagerLoginDto = {
        email: expect.any(String),
        password: expect.any(String),
      };

      mockManagerService.managerLogin.mockResolvedValue({
        managerAccessToken: 'managerAccess',
        managerRefreshToken: 'managerRefresh',
      });

      await managerController.managerLogin(managerLoginDto, mockResponse);

      const cookieOption = {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      };

      expect(mockManagerService.managerLogin).toBeCalledWith(managerLoginDto);
      expect(mockResponse.setHeader).toBeCalledWith(
        'Authorizetion',
        'Bearer managerAccess',
      );
      expect(mockResponse.cookie).toBeCalledWith(
        'refresh',
        'managerRefresh',
        cookieOption,
      );
      expect(mockResponse.json).toBeCalledWith({ msg: '관리자 로그인' });
    });
  });
});
