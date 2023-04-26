import {
  Controller,
  Post,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create.reservation.dto';
import { AccessTokenGuard } from '../auth/jwt/access.guard';
import { User } from '../entities/user.entity';
import { GetUser } from '../decorator/get.user.decorator';

@Controller('reservations')
//클래스 레벨에서 가드 사용
@UseGuards(AccessTokenGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  //예약정보 생성 API
  @Post(':id')
  @UsePipes(ValidationPipe)
  createReservation(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    const userId = user.id;
    const houseId = Number(id);
    const reservationInfo = {
      userId,
      houseId,
      ...createReservationDto,
    };
    return this.reservationsService.createReservation(reservationInfo);
  }

  //사용자 예약정로 리스트 조회 API
  @Get('my')
  getMyReservation(@GetUser() user: User) {
    const userId = user.id;

    return this.reservationsService.getMyReservation(userId);
  }
}
