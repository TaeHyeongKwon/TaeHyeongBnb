import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from '../entities/reservation.entity';
import { FindOneOptions, LessThan, MoreThan, Repository } from 'typeorm';
import { ReservationInfo } from './interface/reservation.interface';
import { HousesService } from '../houses/houses.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @Inject(forwardRef(() => HousesService))
    private housesService: HousesService,
  ) {}

  //예약정보 저장
  async createReservation(
    reservationInfo: ReservationInfo,
  ): Promise<ReservationInfo> {
    //해당 숙소가 존재하는지 확인
    await this.housesService.findHouse(reservationInfo.houseId);

    //오늘 보다 이전인 check-in예약은 불가능
    const today = new Date().toISOString().split('T')[0];
    if (reservationInfo.check_in <= today)
      throw new BadRequestException('당일 이전의 check-in예약은 불가능');

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
        'reservation.id',
        'reservation.houseId',
        'reservation.check_in',
        'reservation.check_out',
        'house.name',
        'house.address',
      ])
      .where('reservation.userId = :userId', { userId })
      .getRawMany();
  }

  //숙소ID로 예약 조회
  async getReservationByHouseId(houseId: number): Promise<Reservation[]> {
    return await this.reservationRepository.find({ where: { houseId } });
  }

  //예약ID로 조회
  async getReservation(id: number): Promise<Reservation> {
    const existReservation = await this.reservationRepository.findOne({
      where: { id },
    });
    if (!existReservation) throw new NotFoundException('예약 정보 없음');

    return existReservation;
  }

  //예약 최소하기
  async deleteReservation(id: number, userId: number): Promise<{ msg }> {
    const existReservation = await this.getReservation(id);
    if (existReservation.userId !== userId)
      throw new ForbiddenException('취소 권한 없음');

    const today = new Date().toISOString().split('T')[0];
    if (existReservation.check_in <= today)
      throw new BadRequestException('취소 가능 날짜 아님');

    await this.reservationRepository.delete(id);

    return { msg: '취소완료' };
  }

  async findByFields(
    options: FindOneOptions<Reservation>,
  ): Promise<Reservation | undefined> {
    return await this.reservationRepository.findOne(options);
  }
}
