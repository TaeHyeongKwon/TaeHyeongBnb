import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SignUpInterface } from './interface/auth.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    //typeORM의 DataSource객체 주입
    private dataSource: DataSource,
  ) {}

  //이메일 및 닉네임 중복 확인
  async findByFields(
    options: FindOneOptions<SignUpInterface>,
  ): Promise<User | undefined> {
    return await this.userRepository.findOne(options);
  }

  //유저 정보 저장
  async saveUserInfo(userInfo: SignUpInterface): Promise<User> {
    // 주입한 dataSource객체로 QueryRunner생성
    const queryRunner = this.dataSource.createQueryRunner();
    //QueryRunner로 DB연결
    await queryRunner.connect();
    //트랜잭션 시작
    await queryRunner.startTransaction();
    try {
      //비밀번호 해싱처리
      await this.transformPassword(userInfo);

      const user = new User();
      user.email = userInfo.email;
      user.nickname = userInfo.nickname;
      user.password = userInfo.password;
      user.registration_path = userInfo.registration_path;

      const result = await queryRunner.manager.save(user);
      //트랜잭션 성공 후 적용
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      console.error(err);
      //트랜잭션중 실패하면 롤백
      await queryRunner.rollbackTransaction();
      throw new HttpException('회원가입 트랜잭션 롤백 에러', 500);
    } finally {
      //트랜잭션 완료 후 연결끊기
      await queryRunner.release();
    }

    // return await this.userRepository.save(userInfo);
  }

  //패스워드 해싱
  async transformPassword(userDto: SignUpInterface): Promise<void> {
    userDto.password = await bcrypt.hash(userDto.password, 10);
  }

  async findById(id: number): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'nickname'],
    });
  }
}
