import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from '../entities/review.entity';
import { Repository } from 'typeorm';
import { HousesService } from 'src/houses/houses.service';
import { ReservationsService } from 'src/reservations/reservations.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepository: Repository<Review>,
    private housesService: HousesService,
    private reservationsService: ReservationsService,
  ) {}
  async createReview(
    userId: number,
    reservationId: number,
    createReviewDto: CreateReviewDto,
  ): Promise<{ msg: string }> {
    const existReservation = await this.reservationsService.findByFields({
      where: { id: reservationId },
    });

    //해당 숙소에 예약했던 정보가 없다면 에러
    if (!existReservation) throw new BadRequestException('예약 정보 없음');

    const houseInfo = await this.housesService.findHouse(
      existReservation.houseId,
    );

    //예약날짜의 체크아웃 시간이 리뷰작성 날짜보다 앞선다면 에러
    const today = new Date().toISOString().split('T')[0];
    if (existReservation.check_out >= today)
      throw new BadRequestException('리뷰는 숙소 체크아웃 이후 작성 가능');

    //해당 예약정보로된 리뷰가 이미 작성되어 있다면 에러
    const existReview = await this.reviewRepository.findOne({
      where: { reservationId },
    });
    if (existReview) throw new ConflictException('해당 예약의 리뷰가 존재');

    console.log(createReviewDto);
    const reviewInfo = await this.reviewRepository.create({
      userId,
      houseId: houseInfo.id,
      reservationId,
      ...createReviewDto,
    });

    console.log(reviewInfo);

    await this.reviewRepository.save(reviewInfo);

    return { msg: '리뷰 작성 성공' };
  }

  async findAll(houseId): Promise<Review[]> {
    //해당 숙소 페이지가 있는지 확인
    await this.housesService.findHouse(houseId);

    return await this.reviewRepository.find({ where: { houseId } });
  }
}
