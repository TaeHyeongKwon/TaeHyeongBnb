import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { FindAllHouseDto } from './dto/findall.house.dto';
import { House } from '../entities/house.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateHouseDto } from './dto/create.house.dto';
import { User } from 'src/entities/user.entity';
import { deleteImageInS3 } from '../../common/multerOption';
import { UpdateHouseDto } from './dto/update.house.dto';
import { ReservationsService } from '../reservations/reservations.service';

@Injectable()
export class HousesService {
  constructor(
    @InjectRepository(House) private houseRepository: Repository<House>,
    private dataSource: DataSource,
    @Inject(forwardRef(() => ReservationsService))
    private reservationService: ReservationsService,
  ) {}

  async findHouseList(findAllHouseDto: FindAllHouseDto): Promise<object[]> {
    return await this.houseRepository.find({
      order: { pricePerDay: findAllHouseDto.sort },
      skip: 4 * (Number(findAllHouseDto.page) - 1),
      take: 4,
      select: [
        'id',
        'name',
        'university',
        'images',
        'houseType',
        'pricePerDay',
      ],
    });
  }

  async createHouse(
    user: User,
    createHouseDto: CreateHouseDto,
    files: Array<Express.MulterS3.File>,
  ): Promise<House> {
    if (user.host_certification !== true)
      throw new ForbiddenException('호스트 등록 필요');

    //최소 1개 이상의 이미지가 필요
    if (!files[0]) throw new BadRequestException('이미지가 없습니다.');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    const images = files.map((file, index) => {
      const url = file.location;
      const key = index + 1;
      return { url, key };
    });

    try {
      const house = await this.houseRepository.create({
        userId: user.id,
        ...createHouseDto,
        images,
      });

      const houseInfo = await queryRunner.manager.save(house);

      await queryRunner.commitTransaction();
      return houseInfo;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      for (const toBeDeletedImage of images) {
        await deleteImageInS3(toBeDeletedImage);
      }
      throw new HttpException('매물등록 트랜잭션 롤백 에러', 500);
    } finally {
      await queryRunner.release();
    }
  }

  async findHouse(id: number): Promise<House> {
    const houseInfo = await this.houseRepository.findOne({ where: { id } });
    if (!houseInfo) throw new NotFoundException('없는 숙소 입니다.');
    return houseInfo;
  }

  async getWrittenHouseDetail(userId: number, id: number) {
    const writtenHouseDetail = await this.findHouse(id);
    if (writtenHouseDetail.userId !== userId)
      throw new ForbiddenException('매물 수정 권한이 없음');

    return writtenHouseDetail;
  }

  async updateHouse(
    id: number,
    user: User,
    updateHouseDto: UpdateHouseDto,
    files: Array<Express.MulterS3.File>,
  ) {
    const addedImages = files.map((file, index) => {
      const url = file.location;
      const key = index + 1;
      return { url, key };
    });

    try {
      const existHouse = await this.findHouse(id);
      if (existHouse.userId !== user.id)
        throw new ForbiddenException('매물 수정 권한이 없음');

      //기존의 이미지 개수와, 들어온 파일의 배열에서 이미지 개수를 더해서 5개가 넘으면 에러
      if (existHouse.images.length + addedImages.length > 5)
        throw new HttpException('이미지 5개 초과', 413);

      const images = [...existHouse.images, ...addedImages].map(
        (obj, index) => {
          obj.key = index + 1;
          return obj;
        },
      );

      const updatedHouse = { userId: user.id, ...updateHouseDto, images };

      await this.houseRepository.update(id, updatedHouse);
    } catch (e) {
      for (const toBeDeletedImage of addedImages) {
        await deleteImageInS3(toBeDeletedImage);
      }
      throw e;
    }
  }

  //삭제하기는 하나의 이미지씩 제거한다.(key를 1개씩 받기 때문에)
  async deleteImage(id: number, key: number, userId: number): Promise<void> {
    //DB에서 house 정보를 조회
    const houseInfo = await this.findHouse(id);

    if (houseInfo.userId !== userId)
      throw new ForbiddenException('삭제 권한 없음');

    // house정보 중에 Image배열에서 삭제할 key가 포함된 객체
    const toBeDeletedImage = houseInfo.images.find((obj) => obj.key === key);

    //house정보 중에 Image배열에서 삭제할 key가 포함된 객체를 제거한 나머지 객체
    const excludedImages = houseInfo.images.filter((obj) => obj.key !== key);

    if (excludedImages.length === 0)
      throw new BadRequestException('최소 1개 이미지는 필수');

    //나머지 객체의 key를 재정렬
    const updatedImages = excludedImages.map((obj, index) => {
      obj.key = index + 1;
      return obj;
    });

    //삭제되고 정렬된 Images배열로 DB업데이트
    await this.houseRepository.update({ id: id }, { images: updatedImages });

    //삭제한 이미지를 S3에서도 제거
    await deleteImageInS3(toBeDeletedImage);
  }

  async deleteHouse(id: number, userId: number): Promise<{ msg: string }> {
    const houseInfo = await this.findHouse(id);

    if (houseInfo.userId !== userId)
      throw new ForbiddenException('삭제 권한 없음');

    const existReservation =
      await this.reservationService.getReservationByHouseId(id);

    if (existReservation.length > 0)
      throw new ConflictException('예약이 존재하는 숙소는 삭제 불가');

    await this.houseRepository.delete(id);

    for (const toBeDeletedImage of houseInfo.images)
      await deleteImageInS3(toBeDeletedImage);

    return { msg: '삭제완료' };
  }
}
