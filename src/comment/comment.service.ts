import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { HousesService } from '../houses/houses.service';
import { ReviewService } from '../review/review.service';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    private housesService: HousesService,
    private reviewService: ReviewService,
  ) {}

  async findByFields(options: FindOneOptions<Comment>): Promise<Comment> {
    const existComment = await this.commentRepository.findOne(options);
    if (!existComment) throw new NotFoundException('없는 댓글');
    return existComment;
  }

  async create(
    userId: number,
    reviewId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<{ msg: string }> {
    const existReview = await this.reviewService.findByFields({
      where: { id: reviewId },
    });
    if (!existReview) throw new NotFoundException('없는 리뷰');

    const existHouse = await this.housesService.findHouse(existReview.houseId);
    if (existHouse.userId !== userId)
      throw new ForbiddenException('이 숙소의 호스트가 아님');

    const existComment = await this.findByFields({ where: { reviewId } });
    if (existComment) throw new ConflictException('리뷰 댓글 중복');

    const commentInfo = this.commentRepository.create({
      userId,
      reviewId,
      ...createCommentDto,
    });

    await this.commentRepository.save(commentInfo);
    return { msg: '리뷰 답글 작성 완료' };
  }
}
