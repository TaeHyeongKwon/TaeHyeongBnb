import { Test, TestingModule } from '@nestjs/testing';
import { HousesService } from './houses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { House } from '../entities/house.entity';
import { FindAllHouseDto, ListSort } from './dto/findall.house.dto';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { ReservationsService } from '../reservations/reservations.service';
import { DataSource } from 'typeorm';
import { CreateHouseDto } from './dto/create.house.dto';
import { User } from '../entities/user.entity';
import * as multerFn from '../../common/multerOption';

describe('HousesService', () => {
  let houseService: HousesService;

  const mockHouseRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  };

  const mockReservationService = {
    getReservationByHouseId: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HousesService,
        { provide: getRepositoryToken(House), useValue: mockHouseRepository },
        { provide: ReservationsService, useValue: mockReservationService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    houseService = module.get<HousesService>(HousesService);
  });

  it('should be defined', () => {
    expect(houseService).toBeDefined();
  });

  it('숙소 리스트 조회 성공 케이스', async () => {
    const findAllHouseDto: FindAllHouseDto = { page: '1', sort: ListSort.DESC };

    mockHouseRepository.find = jest.fn(() => {
      return 'find result';
    });

    const result = await houseService.findHouseList(findAllHouseDto);

    expect(result).toEqual('find result');
    expect(mockHouseRepository.find).toHaveBeenCalledTimes(1);
    expect(mockHouseRepository.find).toHaveBeenCalledWith({
      order: { pricePerDay: findAllHouseDto.sort },
      skip: 4 * (Number(findAllHouseDto.page) - 1),
      take: 4,
      select: [
        'id',
        'name',
        'university',
        'images',
        'houseType',
        'pricePerDay',
      ],
    });
  });

  it('숙소 등록 성공 케이스', async () => {
    const user = new User();
    user.id = expect.any(Number);
    user.host_certification = true;

    const createHouseDto: CreateHouseDto = {
      name: expect.any(String),
      description: expect.any(String),
      address: expect.any(String),
      houseType: expect.any(String),
      pricePerDay: expect.any(Number),
    };

    const files = [
      { location: 'image/url/location1' },
      { location: 'image/url/location2' },
    ] as Array<Express.MulterS3.File>;

    mockQueryRunner.manager.save.mockResolvedValue({
      id: expect.any(Number),
      userId: user.id,
      name: createHouseDto.name,
      description: createHouseDto.description,
      address: createHouseDto.address,
      houseType: createHouseDto.houseType,
      pricePerDay: createHouseDto.pricePerDay,
      images: [
        { key: 1, url: 'image/url/location1' },
        { key: 2, url: 'image/url/location2' },
      ],
    });

    const result = await houseService.createHouse(user, createHouseDto, files);

    expect(result).toEqual({
      id: 1,
      userId: 1,
      name: '테스트 이름',
      description: '테스트 설명',
      address: '테스트 주소',
      houseType: '테스트 종류',
      pricePerDay: 100000,
      images: [
        { key: 1, url: 'image/url/location1' },
        { key: 2, url: 'image/url/location2' },
      ],
    });
    expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(0);
    expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('숙소 생성시 권한 없음 예외 케이스', async () => {
    const user = new User();
    user.id = expect.any(Number);
    user.host_certification = undefined || false;

    const createHouseDto: CreateHouseDto = {
      name: expect.any(String),
      description: expect.any(String),
      address: expect.any(String),
      houseType: expect.any(String),
      pricePerDay: expect.any(Number),
    };

    const files = [
      { location: 'image/url/location1' },
      { location: 'image/url/location2' },
    ] as Array<Express.MulterS3.File>;

    try {
      await houseService.createHouse(user, createHouseDto, files);
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenException);
      expect(e.message).toEqual('호스트 등록 필요');
    }
  });

  it('숙소 생성시 이미지 파일 없음 예외 케이스', async () => {
    const user = new User();
    user.id = expect.any(Number);
    user.host_certification = true;

    const createHouseDto: CreateHouseDto = {
      name: expect.any(String),
      description: expect.any(String),
      address: expect.any(String),
      houseType: expect.any(String),
      pricePerDay: expect.any(Number),
    };

    const files = [];

    try {
      await houseService.createHouse(user, createHouseDto, files);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toEqual('이미지가 없습니다.');
    }
  });

  it('숙소 등록 실패 트랜젝션 예외 케이스', async () => {
    const user = new User();
    user.id = expect.any(Number);
    user.host_certification = true;

    const createHouseDto: CreateHouseDto = {
      name: expect.any(String),
      description: expect.any(String),
      address: expect.any(String),
      houseType: expect.any(String),
      pricePerDay: expect.any(Number),
    };

    const files = [
      { location: 'image/url/location1' },
      { location: 'image/url/location2' },
    ] as Array<Express.MulterS3.File>;

    jest.spyOn(mockQueryRunner.manager, 'save').mockImplementation(() => {
      throw new Error();
    });

    try {
      jest.spyOn(multerFn, 'deleteImageInS3').mockReturnValue(undefined);
      await houseService.createHouse(user, createHouseDto, files);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.message).toEqual('매물등록 트랜잭션 롤백 에러');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    }
  });

  it('숙소 상세 조회 성공 케이스', async () => {
    mockHouseRepository.findOne = jest.fn(() => {
      return 'findOne result';
    });

    const id = 1;

    const result = await houseService.findHouse(id);

    expect(result).toEqual('findOne result');
    expect(mockHouseRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockHouseRepository.findOne).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it('숙소 상세 조회 예외 케이스', async () => {
    jest.spyOn(houseService, 'findHouse').mockReturnValue(undefined);
    try {
      await houseService.findHouse(1);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
      expect(e.message).toEqual('없는 숙소 입니다.');
    }
  });

  it('작성된 숙소 정보 조회 성공 케이스', async () => {
    const userId = 1;
    const id = 1;

    const house = {
      id: 1,
      userId: 1,
      name: '테스트 이름',
      description: '테스트 설명',
      address: '테스트 주소',
      houseType: '테스트 종류',
      pricePerDay: 100000,
      images: [
        { key: 1, url: 'image/url/location1' },
        { key: 2, url: 'image/url/location2' },
      ],
    } as House;

    jest.spyOn(houseService, 'findHouse').mockResolvedValue(house);

    const result = await houseService.getWrittenHouseDetail(userId, id);

    expect(result).toEqual(house);
  });

  it('작성된 숙소 정보 조회 실패 예외 케이스', async () => {
    const userId = 1;
    const id = 1;

    const house = {
      id: 1,
      userId: 3,
      name: '테스트 이름',
      description: '테스트 설명',
      address: '테스트 주소',
      houseType: '테스트 종류',
      pricePerDay: 100000,
      images: [
        { key: 1, url: 'image/url/location1' },
        { key: 2, url: 'image/url/location2' },
      ],
    } as House;

    jest.spyOn(houseService, 'findHouse').mockResolvedValue(house);

    try {
      await houseService.getWrittenHouseDetail(userId, id);
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenException);
      expect(e.message).toEqual('매물 수정 권한이 없음');
    }
  });
});
