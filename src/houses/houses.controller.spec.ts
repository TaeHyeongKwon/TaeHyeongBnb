import { Test, TestingModule } from '@nestjs/testing';
import { HousesController } from './houses.controller';
import { HousesService } from './houses.service';
import { FindAllHouseDto, ListSort } from './dto/findall.house.dto';
import { Request } from 'express';

//테스트케이스 'HouseController'
describe('HousesController', () => {
  let housesController: HousesController;

  const mockHouseService = {
    findHouseList: jest.fn(),
    findHouse: jest.fn(),
  };

  const mockRequest: Request = {
    params: jest.fn(),
  } as unknown as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HousesController],
      providers: [HousesService],
    })
      .overrideProvider(HousesService)
      .useValue(mockHouseService)
      .compile();

    housesController = module.get<HousesController>(HousesController);
  });

  it('should be defined', () => {
    expect(housesController).toBeDefined();
  });

  it('숙소 리스트 조회 성공 case', async () => {
    const findAllHouseDto: FindAllHouseDto = { page: '1', sort: ListSort.ASC };

    const houseslist = [
      {
        id: 4,
        name: '너와집',
        university: '서울대학교',
        houseType: '아파트',
        pricePerDay: 20000,
        images: [
          {
            key: 1,
            url: 'http://www.cha.go.kr/unisearch/images/imp_folklore_material/1633792.jpg',
          },
          {
            key: 2,
            url: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Korea-Samcheok-Neowajip-Shingled_house-02.jpg',
          },
          {
            id: 1,
            name: '산포리 펜션',
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
          },
        ],
      },
    ];

    mockHouseService.findHouseList = jest.fn(() => {
      return houseslist;
    });

    const result = await housesController.findHouseList(findAllHouseDto);

    expect(result).toEqual(houseslist);
    expect(result).toBeInstanceOf(Array);
    expect(mockHouseService.findHouseList).toHaveBeenCalledTimes(1);
    expect(mockHouseService.findHouseList).toHaveBeenCalledWith({
      page: '1',
      sort: 'ASC',
    });
  });

  it('숙소 상세 조회 성공 case', async () => {
    const id = Number(mockRequest.params.id);

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

    expect(result).toBeInstanceOf(Object);
    expect(result).toEqual(houseDetail);
    expect(mockHouseService.findHouse).toHaveBeenCalledWith(id);
    expect(mockHouseService.findHouse).toHaveBeenCalledTimes(1);
  });
});
