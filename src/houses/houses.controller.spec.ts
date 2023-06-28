import { Test, TestingModule } from '@nestjs/testing';
import { HousesController } from './houses.controller';
import { HousesService } from './houses.service';
import { FindAllHouseDto, ListSort } from './dto/findall.house.dto';
import { User } from '../entities/user.entity';
import { CreateHouseDto } from './dto/create.house.dto';
import { UpdateHouseDto } from './dto/update.house.dto';

describe('HousesController', () => {
  let housesController: HousesController;

  const mockHouseService = {
    findHouseList: jest.fn(),
    findHouse: jest.fn(),
    createHouse: jest.fn(),
    getWrittenHouseDetail: jest.fn(),
    updateHouse: jest.fn(),
    deleteImage: jest.fn(),
    deleteHouse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HousesController],
      providers: [{ provide: HousesService, useValue: mockHouseService }],
    }).compile();

    housesController = module.get<HousesController>(HousesController);
  });

  it('should be defined', () => {
    expect(housesController).toBeDefined();
  });

  it('findHouseList success case', async () => {
    const findAllHouseDto: FindAllHouseDto = { page: '1', sort: ListSort.ASC };

    mockHouseService.findHouseList = jest.fn(() => {
      return 'findHouseList result';
    });

    const result = await housesController.findHouseList(findAllHouseDto);

    expect(result).toEqual('findHouseList result');
    expect(mockHouseService.findHouseList).toHaveBeenCalledWith({
      page: '1',
      sort: 'ASC',
    });
  });

  it('createHouse success case', async () => {
    const createHouseDto: CreateHouseDto = {
      name: expect.any(String),
      description: expect.any(String),
      address: expect.any(String),
      houseType: expect.any(String),
      pricePerDay: expect.any(Number),
    };

    const user = new User();
    user.id = expect.any(Number);

    const files = [
      { location: 'image/url/location1' },
      { location: 'image/url/location2' },
    ] as Array<Express.MulterS3.File>;

    mockHouseService.createHouse = jest.fn(() => {
      return 'creat result';
    });

    const result = await housesController.createHouse(
      createHouseDto,
      user,
      files,
    );

    expect(result).toEqual('creat result');
    expect(mockHouseService.createHouse).toBeCalledTimes(1);
  });

  it('findHouse success case', async () => {
    const id = expect.any(Number);

    const houseDetail = {
      id: 1,
      name: '산포리 펜션',
      description:
        '입실/퇴실 시간\n ㅁ 입실시간 : 오후 3시 ~ 오후 10시\n ㅁ 퇴실시간 : 익일 오전 11시 까지\n ㅁ 오후 10시 이후의 입실은 미리 연락부탁드립니다.',
      address: '경상북도 울진군 근남면 세포2길 1-21',
      university: '울진대학교',
      houseType: '펜션',
      pricePerDay: 30000,
      images: [
        {
          key: 1,
          url: 'http://si.wsj.net/public/resources/images/OB-YO176_hodcol_H_20130815124744.jpg',
        },
        {
          key: 2,
          url: 'https://image.pensionlife.co.kr/penimg/pen_1/pen_19/1977/9734f7418fcc01a2321ba800b1f2c7ee.jpg',
        },
      ],
    };

    mockHouseService.findHouse = jest.fn(() => {
      return houseDetail;
    });

    const result = await housesController.findHouse(id);

    expect(result).toEqual(houseDetail);
    expect(mockHouseService.findHouse).toHaveBeenCalledWith(id);
    expect(mockHouseService.findHouse).toHaveBeenCalledTimes(1);
  });

  it('getWrittenHouseDetail success case', async () => {
    const user = new User();
    user.id = expect.any(Number);

    const id = expect.any(Number);

    mockHouseService.getWrittenHouseDetail = jest.fn(() => {
      return 'getWrittenHouseDetail result';
    });

    const result = await housesController.getWrittenHouseDetail(user, id);

    expect(result).toEqual('getWrittenHouseDetail result');
    expect(mockHouseService.getWrittenHouseDetail).toBeCalledTimes(1);
    expect(mockHouseService.getWrittenHouseDetail).toBeCalledWith(user.id, id);
  });

  it('updateHouse success case', async () => {
    const id = 1;
    const updateHouseDto: UpdateHouseDto = {
      name: expect.any(String),
      description: expect.any(String),
      address: expect.any(String),
      houseType: expect.any(String),
      pricePerDay: expect.any(Number),
    };

    const user = new User();
    user.id = 1;

    const files = [
      { location: 'image/url/location3' },
      { location: 'image/url/location4' },
    ] as Array<Express.MulterS3.File>;

    mockHouseService.updateHouse.mockResolvedValue('update result');

    const result = await housesController.updateHouse(
      id,
      updateHouseDto,
      user,
      files,
    );

    expect(result).toEqual('update result');
    expect(mockHouseService.updateHouse).toBeCalledWith(
      id,
      user,
      updateHouseDto,
      files,
    );
    expect(mockHouseService.updateHouse).toBeCalledTimes(1);
  });
});
