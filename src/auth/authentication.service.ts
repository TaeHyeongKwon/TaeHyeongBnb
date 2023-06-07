import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, LessThan, Repository } from 'typeorm';
import { Authentication } from '../entities/authentication.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(Authentication)
    private authenticationRepository: Repository<Authentication>,
  ) {}

  async findByFileds(
    option: FindOneOptions<Authentication>,
  ): Promise<Authentication> {
    return await this.authenticationRepository.findOne(option);
  }

  async saveAuthenticationCode(code: string) {
    //인증코드와 시간을 DB에 저장
    const createdAt = new Date();
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);

    const emailAuthentication = this.authenticationRepository.create({
      code,
      createdAt,
      expiration,
    });

    await this.authenticationRepository.save(emailAuthentication);

    return { msg: '발송완료' };
  }

  //만료시간이 지난 데이터를 2시간마다 자동삭제
  @Cron('* * */2 * * *')
  async deleteExpiredCodeAuto() {
    const thisTime = new Date();
    const existExpiredCodeDate = await this.authenticationRepository.find({
      where: { expiration: LessThan(thisTime) },
    });
    if (existExpiredCodeDate)
      await this.authenticationRepository.delete({
        expiration: LessThan(thisTime),
      });
  }
}
