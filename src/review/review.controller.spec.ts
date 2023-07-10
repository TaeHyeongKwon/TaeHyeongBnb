import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

describe('ReviewController', () => {
  let reviewController: ReviewController;

  const mockReviewService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [{ provide: ReviewService, useValue: mockReviewService }],
    }).compile();

    reviewController = module.get<ReviewController>(ReviewController);
  });

  it('should be defined', () => {
    expect(reviewController).toBeDefined();
  });
});
