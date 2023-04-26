import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from '../entities/reservation.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { ReservationInfo } from './interface/reservation.interface';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
  ) {}

  //예약정보 저장
  async createReservation(
    reservationInfo: ReservationInfo,
  ): Promise<ReservationInfo> {
    //중복날짜 확인
    const existReservation = await this.findDupicatedReservation(
      reservationInfo,
    );
    //중복된 예약이 있으면 에러
    if (existReservation)
      throw new BadRequestException('해당 날짜는 예약이 불가능 합니다.');

    return await this.reservationRepository.save(reservationInfo);
  }

  //선택 날짜 예약 중복 확인
  async findDupicatedReservation(
    reservationInfo: ReservationInfo,
  ): Promise<Reservation | undefined> {
    const { houseId, check_in, check_out } = reservationInfo;

    if (check_in === check_out)
      throw new BadRequestException('예약의 최소 기준은 1박 입니다.');

    return await this.reservationRepository.findOne({
      where: {
        houseId,
        check_in: LessThan(check_out),
        check_out: MoreThan(check_in),
      },
    });
  }

  //사용자의 예약 리스트 조회
  async getMyReservation(userId: number): Promise<object[]> {
    return await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.house', 'house')
      .select([
        'reservation.houseId',
        'reservation.check_in',
        'reservation.check_out',
        'house.name',
        'house.address',
      ])
      .where('reservation.userId = :userId', { userId })
      .getRawMany();
  }
}
