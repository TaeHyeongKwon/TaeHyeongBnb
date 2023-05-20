import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindAllHouseDto } from './dto/findall.house.dto';
import { House } from '../entities/house.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateHouseDto } from './dto/create.house.dto';
import { User } from 'src/entities/user.entity';

@Injectable()
export class HousesService {
  constructor(
    @InjectRepository(House) private houseRepository: Repository<House>,
    private dataSource: DataSource,
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
  ): Promise<void> {
    if (user.host_certification !== true)
      throw new ForbiddenException('호스트 등록 필요');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      if (!files[0]) throw new BadRequestException('이미지가 없습니다.');

      const images = files.map((file, index) => {
        const url = file.location;
        const key = index + 1;
        return { url, key };
      });

      const house = await this.houseRepository.create({
        userId: user.id,
        ...createHouseDto,
        images,
      });

      const result = await queryRunner.manager.save(house);
      console.log(result);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
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
}
