import { Test, TestingModule } from '@nestjs/testing';
import { ManagerService } from './manager.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Manager } from '../entities/manager.entity';
import { JwtService } from '@nestjs/jwt';
import { ManagerSignUpDto } from './dto/manager.signup.dto';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ManagerTokenPayload } from './jwtmanager/m.jwt.payload.interface';
import { ManagerLoginDto } from './dto/manager.login.dto';
import * as bcrypt from 'bcrypt';

describe('ManagerService', () => {
  let managerService: ManagerService;

  const mockManagerRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

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

  describe('managerSignUp', () => {
    it('managerSignUp success case', async () => {
      const managerSignInfo: ManagerSignUpDto = {
        email: expect.any(String),
        password: 'testpass',
        name: expect.any(String),
        department: expect.any(String),
        position: expect.any(String),
      };

      mockManagerRepository.findOne.mockResolvedValue(undefined);

      jest.spyOn(managerService, 'transformPassword');

      mockManagerRepository.create.mockImplementation((managerSignInfo) => {
        return { id: expect.any(Number), ...managerSignInfo };
      });

      mockManagerRepository.save.mockResolvedValue('save result');

      const result = await managerService.managerSignUp(managerSignInfo);

      expect(result).toEqual('save result');
      expect(mockManagerRepository.findOne).toBeCalledTimes(1);
      expect(managerService.transformPassword).toBeCalledTimes(1);
      expect(mockManagerRepository.create).toBeCalledTimes(1);
      expect(mockManagerRepository.save).toBeCalledTimes(1);
      expect(mockManagerRepository.save).toBeCalledWith({
        id: expect.any(Number),
        ...managerSignInfo,
      });
    });

    it('When the same email already exists', async () => {
      const managerSignInfo: ManagerSignUpDto = {
        email: 'testeamil@test.com',
        password: expect.any(String),
        name: expect.any(String),
        department: expect.any(String),
        position: expect.any(String),
      };

      mockManagerRepository.findOne.mockResolvedValue({
        email: 'testeamil@test.com',
      });

      try {
        await managerService.managerSignUp(managerSignInfo);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toEqual('중복 이메일');
      }
    });
  });

  describe('createManagerAccess', () => {
    it('createManagerAccess success case', async () => {
      const payload: ManagerTokenPayload = {
        id: expect.any(Number),
        name: expect.any(String),
      };

      mockJwtService.sign.mockResolvedValue('managerAccess');

      const result = await managerService.createManagerAccess(payload);

      expect(result).toEqual('managerAccess');
      expect(mockJwtService.sign).toBeCalledTimes(1);
    });
  });

  describe('createManagerRefresh', () => {
    it('createManagerRefresh success case', async () => {
      const payload: ManagerTokenPayload = {
        id: expect.any(Number),
        name: expect.any(String),
      };

      mockJwtService.sign.mockResolvedValue('managerRefresh');

      const result = await managerService.createManagerRefresh(payload);

      expect(result).toEqual('managerRefresh');
      expect(mockJwtService.sign).toBeCalledTimes(1);
    });
  });

  describe('managerLogin', () => {
    it('managerLogin success case', async () => {
      const managerLoginDto: ManagerLoginDto = {
        email: expect.any(String),
        password: 'testpass',
      };

      const solt = Number(process.env.M_HASHING_SOLT);

      const managerInfo = {
        id: expect.any(Number),
        email: expect.any(String),
        password: await bcrypt.hash('testpass', solt),
      };

      mockManagerRepository.findOne.mockResolvedValue(managerInfo);

      jest
        .spyOn(managerService, 'createManagerAccess')
        .mockResolvedValue('managerAccess');

      jest
        .spyOn(managerService, 'createManagerRefresh')
        .mockResolvedValue('managerRefresh');

      const result = await managerService.managerLogin(managerLoginDto);

      expect(result).toEqual({
        managerAccessToken: 'managerAccess',
        managerRefreshToken: 'managerRefresh',
      });
    });

    it('When there is no matching email', async () => {
      const managerLoginDto: ManagerLoginDto = {
        email: 'testemail@test.com',
        password: 'testpass',
      };

      mockManagerRepository.findOne.mockResolvedValue(undefined);

      try {
        await managerService.managerLogin(managerLoginDto);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual('email을 확인해 주세요.');
      }
    });

    it('When passwords do not match', async () => {
      const managerLoginDto: ManagerLoginDto = {
        email: expect.any(String),
        password: 'testpass',
      };

      const solt = Number(process.env.M_HASHING_SOLT);

      const managerInfo = {
        id: expect.any(Number),
        email: expect.any(String),
        password: await bcrypt.hash('passtest', solt),
      };

      mockManagerRepository.findOne.mockResolvedValue(managerInfo);

      try {
        await managerService.managerLogin(managerLoginDto);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('password를 확인해 주세요');
      }
    });
  });
});
