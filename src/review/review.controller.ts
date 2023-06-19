import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AccessTokenGuard } from '../auth/jwt/access.guard';
import { GetUser } from '../../common/decorator/get.user.decorator';
import { User } from '../entities/user.entity';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  //리뷰 작성하기
  //리뷰 작성은 예약정보조회 페이지에서 가능
  @Post('/:id')
  @UseGuards(AccessTokenGuard)
  @UsePipes(ValidationPipe)
  createReview(
    @Param('id') id: number,
    @Body() createReviewDto: CreateReviewDto,
    @GetUser() user: User,
  ): Promise<{ msg: string }> {
    const reservationId = id;
    const userId = user.id;
    return this.reviewService.createReview(
      userId,
      reservationId,
      createReviewDto,
    );
  }

  //리뷰 조회하기
  //리뷰 조회는 숙소상세조회 페이지에서 가능, 리뷰조회도 누구든지 가능
  @Get('/:id')
  findReviewList(@Param('id') id: number) {
    const houseId = id;
    return this.reviewService.findAll(houseId);
  }
}
