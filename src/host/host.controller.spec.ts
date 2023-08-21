import { Test, TestingModule } from '@nestjs/testing';
import { HostController } from './host.controller';
import { HostService } from './host.service';
import { User } from '../entities/user.entity';
import { CreateHostDto } from './dto/create-host.dto';
import { CheckSmsDto } from './dto/check-sms.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { GetHostListDto } from './dto/get-hostlist.dto';

describe('HostController', () => {
  let hostController: HostController;

  const mockHostService = {
    createHost: jest.fn(),
    sendSms: jest.fn(),
    checkSms: jest.fn(),
    getHostList: jest.fn(),
    updateHostApproval: jest.fn(),
  };

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

  describe('createHost', () => {
    const user = new User();
    user.id = expect.any(Number);
    const createHostDto: CreateHostDto = {
      name: expect.any(String),
      birth_date: expect.any(String),
      phone_number: expect.any(String),
    };
    it('createHost success case', async () => {
      mockHostService.createHost.mockResolvedValue('service createHost result');
      const result = await hostController.createHost(user, createHostDto);

      expect(result).toEqual('service createHost result');
    });
  });

  describe('sendSms', () => {
    const sendSmsDto: SendSmsDto = {
      phone_number: expect.any(String),
    };
    it('sendSms success case', async () => {
      mockHostService.sendSms.mockResolvedValue(true);
      const result = await hostController.sendSms(sendSmsDto);

      expect(result).toEqual(true);
      expect(mockHostService.sendSms).toBeCalledWith({
        phone_number: expect.any(String),
      });
    });
  });

  describe('checkSms', () => {
    const checkSmsDto: CheckSmsDto = {
      checkCode: '123456',
    };
    it('checkSms success case', async () => {
      mockHostService.checkSms.mockResolvedValue(true);
      const result = await hostController.checkSms(checkSmsDto);

      expect(result).toEqual(true);
      expect(mockHostService.checkSms).toBeCalledWith({
        checkCode: '123456',
      });
    });
  });

  describe('getHostList', () => {
    const query: GetHostListDto = {
      page: expect.any(Number),
    };
    it('getHostList success case', async () => {
      mockHostService.getHostList.mockResolvedValue(
        'service getHostList result',
      );
      const result = await hostController.getHostList(query);
      expect(result).toEqual('service getHostList result');
      expect(mockHostService.getHostList).toBeCalledWith({
        page: expect.any(Number),
      });
    });
  });

  describe('updateHostApproval', () => {
    const id = expect.any(Number);
    it('updateHostApproval success case', async () => {
      mockHostService.updateHostApproval.mockResolvedValue(
        'service updateHostApproval result',
      );
      const result = await hostController.updateHostApproval(id);
      expect(result).toEqual('service updateHostApproval result');
      expect(mockHostService.updateHostApproval).toBeCalledWith(1);
    });
  });
});
