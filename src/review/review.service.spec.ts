import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from '../entities/review.entity';
import { HousesService } from '../houses/houses.service';
import { ReservationsService } from '../reservations/reservations.service';

describe('ReviewService', () => {
  let reviewService: ReviewService;

  const mockReviewRepository = {};

  const mockHousesService = {};

  const mockRerservationsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: getRepositoryToken(Review), useValue: mockReviewRepository },
        { provide: HousesService, useValue: mockHousesService },
        { provide: ReservationsService, useValue: mockRerservationsService },
      ],
    }).compile();

    reviewService = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(reviewService).toBeDefined();
  });
});
