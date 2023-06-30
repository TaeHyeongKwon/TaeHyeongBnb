import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation } from '../entities/reservation.entity';
import { HousesService } from '../houses/houses.service';
import { ReservationInfo } from './interface/reservation.interface';
import { BadRequestException } from '@nestjs/common';

describe('ReservationsService', () => {
  let reservationService: ReservationsService;

  const mockReservationRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
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
});
