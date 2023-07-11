import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from '../entities/comment.entity';
import { HousesService } from '../houses/houses.service';
import { ReviewService } from '../review/review.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('CommentService', () => {
  let commentService: CommentService;

  const mockCommentRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockHousesService = {
    findHouse: jest.fn(),
  };

  const mockReviewService = {
    findByFields: jest.fn(),
  };

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
  });

  describe('create', () => {
    const userId = 1;
    const reviewId = 1;
    const createCommentDto: CreateCommentDto = {
      content: expect.any(String),
    };

    it('create success case', async () => {
      mockReviewService.findByFields.mockResolvedValue({
        houseId: expect.any(Number),
      });

      mockHousesService.findHouse.mockResolvedValue({
        userId: 1,
      });

      jest.spyOn(commentService, 'findByFields').mockResolvedValue(undefined);

      mockCommentRepository.save.mockResolvedValue({
        id: expect.any(Number),
        userId: 1,
        reviewId: 1,
        content: expect.any(String),
      });

      const result = await commentService.create(
        userId,
        reviewId,
        createCommentDto,
      );

      expect(result).toEqual({ msg: '리뷰 답글 작성 완료' });
      expect(mockReviewService.findByFields).toBeCalledTimes(1);
      expect(mockHousesService.findHouse).toBeCalledTimes(1);
      expect(commentService.findByFields).toBeCalledTimes(1);
      expect(mockCommentRepository.create).toBeCalledTimes(1);
      expect(mockCommentRepository.save).toBeCalledTimes(1);
    });

    it('if the review does not exist', async () => {
      mockReviewService.findByFields.mockResolvedValue(undefined);
      try {
        await commentService.create(userId, reviewId, createCommentDto);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual('없는 리뷰');
      }
    });

    it('if userId is different', async () => {
      mockReviewService.findByFields.mockResolvedValue({
        houseId: expect.any(Number),
      });

      mockHousesService.findHouse.mockResolvedValue({
        userId: 2,
      });

      try {
        await commentService.create(userId, reviewId, createCommentDto);
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toEqual('이 숙소의 호스트가 아님');
      }
    });

    it('if review comments are duplicated', async () => {
      mockReviewService.findByFields.mockResolvedValue({
        houseId: expect.any(Number),
      });

      mockHousesService.findHouse.mockResolvedValue({
        userId: 1,
      });

      jest.spyOn(commentService, 'findByFields').mockResolvedValue({
        id: expect.any(Number),
        userId: 1,
        reviewId: 1,
        content: expect.any(String),
      } as Comment);
      try {
        await commentService.create(userId, reviewId, createCommentDto);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toEqual('리뷰 댓글 중복');
      }
    });
  });
});
