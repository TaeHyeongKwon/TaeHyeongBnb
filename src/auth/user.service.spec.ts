import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { SignUpInterface } from './interface/auth.interface';
import { HttpException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockQueryRunner = {
    manager: { save: jest.fn() },
    connect: jest.fn(),
    commitTransaction: jest.fn(),
    startTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => {
      return mockQueryRunner;
    }),
  };

  jest.mock('bcrypt');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('유저 정보 조회 성공 케이스', async () => {
    mockUserRepository.findOne = jest.fn(() => {
      return 'findOne result';
    });

    const result = await userService.findByFields(expect.any(Object));

    expect(result).toEqual('findOne result');
  });

  it('유저 정보 저장 성공 케이스', async () => {
    const userInfo = {
      email: 'test@test.com',
      password: 'testpass',
      nickname: 'testnick',
      registration_path: 'local',
    };

    await userService.transformPassword(userInfo);

    jest.spyOn(userService, 'transformPassword');

    mockDataSource.createQueryRunner().manager.save = jest.fn(() => {
      return expect.any(Object);
    });
    const result = await userService.saveUserInfo(userInfo);

    expect(result).toEqual(expect.any(Object));
    expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
    expect(userService.transformPassword).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(0);
    expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('유저정보 저장 실패 케이스', async () => {
    const userInfo = {
      email: 'test@test.com',
      password: 'testpass',
      nickname: 'testnick',
      registration_path: 'local',
    };

    jest.spyOn(mockQueryRunner.manager, 'save').mockImplementation(() => {
      throw new Error();
    });

    try {
      await userService.saveUserInfo(userInfo);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.status).toEqual(500);
      expect(e.message).toEqual('회원가입 트랜잭션 롤백 에러');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    }
  });

  it('비밀번호 해싱 성공 케이스', async () => {
    const userDto: SignUpInterface = {
      email: 'test@test.com',
      password: 'testpass',
      nickname: 'testnick',
      registration_path: 'local',
    };

    (bcrypt.hash as jest.Mock) = jest.fn(() => {
      return 'hashed password';
    });

    await userService.transformPassword(userDto);

    expect(bcrypt.hash).toBeCalledTimes(1);
    expect(bcrypt.hash).toBeCalledWith('testpass', 10);
  });

  it('토큰에 담을 유저 클레임 정보 조회', async () => {
    const id = expect.any(Number);

    const user = { id, nickname: 'testnick', host_certification: 'true' };

    mockUserRepository.findOne = jest.fn(() => {
      return user;
    });

    const result = await userService.findById(id);

    expect(result).toEqual(user);
  });
});
