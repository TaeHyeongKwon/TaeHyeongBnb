import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { User } from '../entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

describe('CommentController', () => {
  let commentController: CommentController;

  const mockCommentService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [{ provide: CommentService, useValue: mockCommentService }],
    }).compile();

    commentController = module.get<CommentController>(CommentController);
  });

  it('should be defined', () => {
    expect(commentController).toBeDefined();
  });

  describe('create', () => {
    const id = expect.any(Number);
    const user = new User();
    user.id = expect.any(Number);
    const createCommentDto: CreateCommentDto = {
      content: expect.any(String),
    };
    it('create success case', async () => {
      mockCommentService.create.mockResolvedValue('create result');

      const result = await commentController.create(user, createCommentDto, id);

      expect(result).toEqual('create result');
      expect(mockCommentService.create).toBeCalledTimes(1);
      expect(mockCommentService.create).toBeCalledWith(
        user.id,
        id,
        createCommentDto,
      );
    });
  });
});
