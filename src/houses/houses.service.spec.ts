import { Test, TestingModule } from '@nestjs/testing';
import { HousesService } from './houses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { House } from '../entities/house.entity';
import { FindAllHouseDto, ListSort } from './dto/findall.house.dto';
import { NotFoundException } from '@nestjs/common';

describe('HousesService', () => {
  let houseService: HousesService;

  const mockHouseRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HousesService,
        { provide: getRepositoryToken(House), useValue: mockHouseRepository },
      ],
    }).compile();

    houseService = module.get<HousesService>(HousesService);
  });

  it('should be defined', () => {
    expect(houseService).toBeDefined();
  });

  it('숙소 리스트 조회 성공 case', async () => {
    const findAllHouseDto: FindAllHouseDto = { page: '1', sort: ListSort.DESC };

    const houseList = [
      {
        id: 5,
        name: '삼척 신리 너와집과 민속유물',
        university: '울진대학교',
        houseType: '아파트',
        pricePerDay: 50000,
        images: [
          {
            key: 1,
            url: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Korea-Samcheok-Neowajip-Shingled_house-02.jpg',
          },
        ],
      },
      {
        id: 2,
        name: 'House of card',
        university: '가천대학교',
        houseType: '단독주택',
        pricePerDay: 40000,
        images: [
          {
            key: 1,
            url: 'https://image.pensionlife.co.kr/penimg/pen_1/pen_19/1977/9734f7418fcc01a2321ba800b1f2c7ee.jpg',
          },
        ],
      },
    ];

    mockHouseRepository.find = jest.fn(() => {
      return houseList;
    });

    const result = await houseService.findHouseList(findAllHouseDto);

    expect(result).toEqual(houseList);
    expect(result).toBeInstanceOf(Array);
    expect(mockHouseRepository.find).toHaveBeenCalledTimes(1);
    expect(mockHouseRepository.find).toHaveBeenCalledWith({
      order: { pricePerDay: 'DESC' },
      select: [
        'id',
        'name',
        'university',
        'images',
        'houseType',
        'pricePerDay',
      ],
      skip: 0,
      take: 4,
    });
  });

  it('숙소 상세 조회 성공 case', async () => {
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

    mockHouseRepository.findOne = jest.fn(() => {
      return houseDetail;
    });

    const result = await houseService.findHouse(1);

    expect(result).toBeInstanceOf(Object);
    expect(result).toEqual(houseDetail);
    expect(mockHouseRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockHouseRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('숙소 상세 조회 예외 case', async () => {
    try {
      houseService.findHouse(1234);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
    }
  });
});
