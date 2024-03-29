import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation } from '../entities/reservation.entity';
import { HousesService } from '../houses/houses.service';
import { ReservationInfo } from './interface/reservation.interface';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('ReservationsService', () => {
  let reservationService: ReservationsService;

  const mockReservationRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockReturnThis(),
    }),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockHouseService = {
    findHouse: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
        { provide: HousesService, useValue: mockHouseService },
      ],
    }).compile();

    reservationService = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(reservationService).toBeDefined();
  });

  describe('createReservation', () => {
    it('createReservation success case', async () => {
      const reservationInfo: ReservationInfo = {
        userId: expect.any(Number),
        houseId: expect.any(Number),
        check_in: expect.any(String),
        check_out: expect.any(String),
      };
      mockHouseService.findHouse.mockResolvedValue({
        id: reservationInfo.houseId,
      });

      jest
        .spyOn(reservationService, 'findDupicatedReservation')
        .mockResolvedValue(undefined);

      mockReservationRepository.save.mockResolvedValue('save result');

      const result = await reservationService.createReservation(
        reservationInfo,
      );

      expect(result).toEqual('save result');
      expect(reservationService.findDupicatedReservation).toBeCalledTimes(1);
      expect(reservationService.findDupicatedReservation).toBeCalledWith(
        reservationInfo,
      );
      expect(mockReservationRepository.save).toBeCalledTimes(1);
    });

    it('Dates on which check-in is not possible', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const check_in = yesterday.toISOString().split('T')[0];

      const reservationInfo: ReservationInfo = {
        userId: expect.any(Number),
        houseId: expect.any(Number),
        check_in,
        check_out: expect.any(String),
      };

      try {
        await reservationService.createReservation(reservationInfo);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('당일 이전의 check-in예약은 불가능');
      }
    });

    it('When duplicate reservations exist', async () => {
      const reservationInfo: ReservationInfo = {
        userId: expect.any(Number),
        houseId: expect.any(Number),
        check_in: expect.any(String),
        check_out: expect.any(String),
      };
      mockHouseService.findHouse.mockResolvedValue({
        id: reservationInfo.houseId,
      });

      jest
        .spyOn(reservationService, 'findDupicatedReservation')
        .mockResolvedValue({
          result: 'exist reservation',
        } as unknown as Reservation);

      try {
        await reservationService.createReservation(reservationInfo);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('해당 날짜는 예약이 불가능 합니다.');
      }
    });
  });

  describe('findDupicatedReservation', () => {
    it('findDupicatedReservation success case', async () => {
      const reservationInfo: ReservationInfo = {
        userId: expect.any(Number),
        houseId: expect.any(Number),
        check_in: expect.any(String),
        check_out: expect.any(String),
      };
      mockReservationRepository.findOne.mockResolvedValue('findOne result');
      const result = await reservationService.findDupicatedReservation(
        reservationInfo,
      );

      expect(result).toEqual('findOne result');
      expect(mockReservationRepository.findOne).toBeCalledTimes(1);
    });

    it('When check-in and check-out are the same', async () => {
      const reservationInfo: ReservationInfo = {
        userId: expect.any(Number),
        houseId: expect.any(Number),
        check_in: '2023-06-29',
        check_out: '2023-06-29',
      };
      try {
        await reservationService.findDupicatedReservation(reservationInfo);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('예약의 최소 기준은 1박 입니다.');
      }
    });
  });

  describe('getMyReservation', () => {
    it('getMyReservation success case', async () => {
      const userId = expect.any(Number);

      jest
        .spyOn(mockReservationRepository.createQueryBuilder(), 'getRawMany')
        .mockResolvedValue([]);
      const result = await reservationService.getMyReservation(userId);

      expect(result).toEqual([]);
      expect(
        mockReservationRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(1);
      expect(
        mockReservationRepository.createQueryBuilder().select,
      ).toBeCalledTimes(1);
      expect(
        mockReservationRepository.createQueryBuilder().where,
      ).toBeCalledTimes(1);
      expect(
        mockReservationRepository.createQueryBuilder().getRawMany,
      ).toBeCalledTimes(1);
    });
  });

  describe('getReservationByHouseId', () => {
    it('getReservationByHouseId success case', async () => {
      const houseId = expect.any(Number);

      mockReservationRepository.find.mockResolvedValue('find result');
      const result = await reservationService.getReservationByHouseId(houseId);

      expect(result).toEqual('find result');
      expect(mockReservationRepository.find).toBeCalledTimes(1);
    });
  });

  describe('getReservation', () => {
    it('getReservation success case', async () => {
      const id = expect.any(Number);

      mockReservationRepository.findOne.mockResolvedValue('findOne result');

      const result = await reservationService.getReservation(id);

      expect(result).toEqual('findOne result');
      expect(mockReservationRepository.findOne).toBeCalledTimes(1);
    });

    it('When reservation does not exist', async () => {
      const id = expect.any(Number);

      mockReservationRepository.findOne.mockResolvedValue(undefined);

      try {
        await reservationService.getReservation(id);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual('예약 정보 없음');
      }
    });
  });

  describe('deleteReservation', () => {
    it('deleteReservation success case', async () => {
      const id = 1;
      const userId = 1;

      const today = new Date();
      const possibleDate = new Date(today);
      possibleDate.setDate(possibleDate.getDate() + 5);

      const check_in = possibleDate.toISOString().split('T')[0];

      jest
        .spyOn(reservationService, 'getReservation')
        .mockResolvedValue({ id, userId, check_in } as Reservation);

      const result = await reservationService.deleteReservation(id, userId);

      expect(reservationService.getReservation).toBeCalledTimes(1);
      expect(mockReservationRepository.delete).toBeCalledTimes(1);
      expect(mockReservationRepository.delete).toBeCalledWith(id);
      expect(result).toEqual({ msg: '취소완료' });
    });

    it('When userId is different', async () => {
      const id = 1;
      const userId = 1;

      const today = new Date();
      const possibleDate = new Date(today);
      possibleDate.setDate(possibleDate.getDate() + 5);

      const check_in = possibleDate.toISOString().split('T')[0];

      jest
        .spyOn(reservationService, 'getReservation')
        .mockResolvedValue({ id, userId: 2, check_in } as Reservation);

      try {
        await reservationService.deleteReservation(id, userId);
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toEqual('취소 권한 없음');
      }
    });

    it('When the check-in date has already passed', async () => {
      const id = 1;
      const userId = 1;

      const today = new Date();
      const impossibleDate = new Date(today);
      impossibleDate.setDate(impossibleDate.getDate() - 2);

      const check_in = impossibleDate.toISOString().split('T')[0];

      jest
        .spyOn(reservationService, 'getReservation')
        .mockResolvedValue({ id: 1, userId, check_in } as Reservation);

      try {
        await reservationService.deleteReservation(id, userId);
      } catch (e) {
        expect(reservationService.getReservation).toBeCalledTimes(1);
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('취소 가능 날짜 아님');
      }
    });
  });

  describe('findByFields', () => {
    it('findByFields success case', async () => {
      const options = expect.any(Object);

      mockReservationRepository.findOne.mockResolvedValue('findOne result');

      const result = await reservationService.findByFields(options);

      expect(result).toEqual('findOne result');
      expect(mockReservationRepository.findOne).toBeCalledTimes(1);
    });
  });
});
