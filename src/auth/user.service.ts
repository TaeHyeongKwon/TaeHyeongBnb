import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  //이메일 및 닉네임 중복 확인
  async findByFields(
    options: FindOneOptions<SignUpDto>,
  ): Promise<User | undefined> {
    return await this.userRepository.findOne(options);
  }

  //유저 정보 저장
  async saveUserInfo(userInfo: SignUpDto): Promise<SignUpDto> {
    //비밀번호 해싱처리 후 저장
    await this.transformPassword(userInfo);
    return await this.userRepository.save(userInfo);
  }

  //패스워드 해싱
  async transformPassword(userDto: SignUpDto): Promise<void> {
    userDto.password = await bcrypt.hash(userDto.password, 10);
  }

  async findById(id: number): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'nickname'],
    });
  }
}
