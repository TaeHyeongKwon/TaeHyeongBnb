import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from '../entities/review.entity';
import { HousesService } from '../houses/houses.service';
import { ReservationsService } from '../reservations/reservations.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('ReviewService', () => {
  let reviewService: ReviewService;

  const mockReviewRepository = {
    findOne: jest.fn(),
    create: jest.fn((x) => {
      return { id: expect.any(Number), ...x };
    }),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockHousesService = {
    findHouse: jest.fn(),
  };

  const mockReservationsService = {
    findByFields: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: getRepositoryToken(Review), useValue: mockReviewRepository },
        { provide: HousesService, useValue: mockHousesService },
        { provide: ReservationsService, useValue: mockReservationsService },
      ],
    }).compile();

    reviewService = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(reviewService).toBeDefined();
  });

  describe('createReview', () => {
    const userId = expect.any(Number);
    const reservationId = expect.any(Number);
    const createReviewDto: CreateReviewDto = {
      content: expect.any(String),
    };

    const today = new Date();
    const possibleDate = new Date(today);
    possibleDate.setDate(possibleDate.getDate() - 3);
    let check_out = possibleDate.toISOString().split('T')[0];

    it('createReview success case', async () => {
      mockReservationsService.findByFields.mockResolvedValue({ check_out });
      mockHousesService.findHouse.mockReturnValue({
        id: expect.any(Number),
      });
      mockReviewRepository.findOne.mockResolvedValue(undefined);

      const result = await reviewService.createReview(
        userId,
        reservationId,
        createReviewDto,
      );

      expect(result).toEqual({ msg: '리뷰 작성 성공' });
      expect(mockReservationsService.findByFields).toBeCalledTimes(1);
      expect(mockHousesService.findHouse).toBeCalledTimes(1);
      expect(mockReviewRepository.create).toBeCalledTimes(1);
      expect(mockReviewRepository.findOne).toBeCalledTimes(1);
      expect(mockReviewRepository.save).toBeCalledTimes(1);
      expect(mockReviewRepository.save).toBeCalledWith({
        id: 2,
        content: 'test content',
        houseId: 1,
        reservationId: 2,
        userId: 1,
      });
    });

    it('when there is no reservation', async () => {
      mockReservationsService.findByFields.mockResolvedValue(undefined);

      try {
        await reviewService.createReview(
          userId,
          reservationId,
          createReviewDto,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('예약 정보 없음');
      }
    });

    it('Can not write a review before check out', async () => {
      const impossibleDate = new Date(today);
      impossibleDate.setDate(possibleDate.getDate() + 1);
      check_out = impossibleDate.toISOString().split('T')[0];

      mockReservationsService.findByFields.mockResolvedValue({ check_out });
      mockHousesService.findHouse.mockReturnValue({
        id: expect.any(Number),
      });

      try {
        await reviewService.createReview(
          userId,
          reservationId,
          createReviewDto,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('리뷰는 숙소 체크아웃 이후 작성 가능');
      }
    });

    it('already exist review for the reservation', async () => {
      mockReservationsService.findByFields.mockResolvedValue({ check_out });
      mockHousesService.findHouse.mockReturnValue({
        id: expect.any(Number),
      });
      mockReviewRepository.findOne.mockResolvedValue('exist review');
      try {
        await reviewService.createReview(
          userId,
          reservationId,
          createReviewDto,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toEqual('해당 예약의 리뷰가 존재');
      }
    });
  });

  describe('findAll', () => {
    const houseId = expect.any(Number);
    it('findAll success case', async () => {
      mockHousesService.findHouse.mockResolvedValue('findHouse result');

      mockReviewRepository.find.mockResolvedValue('find result');

      const result = await reviewService.findAll(houseId);

      expect(result).toEqual('find result');
      expect(mockHousesService.findHouse).toBeCalledTimes(1);
      expect(mockReviewRepository.find).toBeCalledTimes(1);
    });
  });

  describe('findByFields', () => {
    const option = expect.any(Object);
    it('findByFields success case', async () => {
      mockReviewRepository.findOne.mockResolvedValue('findOne result');

      const result = await reviewService.findByFields(option);

      expect(result).toEqual('findOne result');
      expect(mockReviewRepository.findOne).toBeCalledTimes(1);
    });
  });
});
