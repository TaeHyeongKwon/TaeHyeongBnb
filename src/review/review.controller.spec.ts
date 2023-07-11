import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from '../entities/user.entity';

describe('ReviewController', () => {
  let reviewController: ReviewController;

  const mockReviewService = {
    createReview: jest.fn(),
    findAll: jest.fn(),
  };

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

  describe('createReview', () => {
    const id = expect.any(Number);
    const createReviewDto: CreateReviewDto = {
      content: expect.any(String),
    };
    const user = new User();
    user.id = expect.any(Number);

    it('createReview success case', async () => {
      mockReviewService.createReview.mockResolvedValue('createReview result');

      const result = await reviewController.createReview(
        id,
        createReviewDto,
        user,
      );

      expect(result).toEqual('createReview result');
      expect(mockReviewService.createReview).toBeCalledTimes(1);
      expect(mockReviewService.createReview).toBeCalledWith(
        user.id,
        id,
        createReviewDto,
      );
    });
  });

  describe('findReviewList', () => {
    const id = expect.any(Number);
    it('findReviewList success case', async () => {
      mockReviewService.findAll.mockResolvedValue('findAll result');
      const result = await reviewController.findReviewList(id);

      expect(result).toEqual('findAll result');
      expect(mockReviewService.findAll).toBeCalledTimes(1);
      expect(mockReviewService.findAll).toBeCalledWith(id);
    });
  });
});
