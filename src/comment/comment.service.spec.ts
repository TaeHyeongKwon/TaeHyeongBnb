import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from '../entities/comment.entity';
import { HousesService } from '../houses/houses.service';
import { ReviewService } from '../review/review.service';
import { NotFoundException } from '@nestjs/common';

describe('CommentService', () => {
  let commentService: CommentService;

  const mockCommentRepository = {
    findOne: jest.fn(),
  };

  const mockHousesService = {};

  const mockReviewService = {};

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        { provide: HousesService, useValue: mockHousesService },
        { provide: ReviewService, useValue: mockReviewService },
      ],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(commentService).toBeDefined();
  });

  describe('findByFields', () => {
    const options = expect.any(Object);
    it('findByFields success case', async () => {
      mockCommentRepository.findOne.mockResolvedValue('findOne result');

      const result = await commentService.findByFields(options);
      expect(result).toEqual('findOne result');
      expect(mockCommentRepository.findOne).toBeCalledTimes(1);
      expect(mockCommentRepository.findOne).toHaveBeenCalledWith(options);
    });

    it('If the comment does not exist', async () => {
      mockCommentRepository.findOne.mockResolvedValue(undefined);

      try {
        await commentService.findByFields(options);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual('없는 댓글');
      }
    });
  });
});
