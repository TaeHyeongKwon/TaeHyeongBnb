import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Param,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AccessTokenGuard } from '../auth/jwt/access.guard';
import { User } from '../entities/user.entity';
import { GetUser } from '../../common/decorator/get.user.decorator';
@Controller('comment')
@UseGuards(AccessTokenGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/:id')
  @UsePipes(ValidationPipe)
  async create(
    @GetUser() user: User,
    @Body() createCommentDto: CreateCommentDto,
    @Param('id') id: number,
  ) {
    const userId = user.id;
    const reviewId = id;
    return await this.commentService.create(userId, reviewId, createCommentDto);
  }
}
