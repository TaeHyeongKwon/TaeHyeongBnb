import { ConflictException, Injectable } from '@nestjs/common';
import { ManagerLoginDto } from './dto/manager.login.dto';
import { ManagerSignUpDto } from './dto/manager.signup.dto';
import { Manager } from '../entities/manager.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManagerTokenPayload } from './jwtmanager/m.jwt.payload.interface';
import * as bcrypt from 'bcrypt';

const { M_ACCESS_SECRET, M_REFRESH_SECREY, M_HASHING_SOLT } = process.env;

@Injectable()
export class ManagerService {
  jwtService: any;
  constructor(
    @InjectRepository(Manager) private managerRepository: Repository<Manager>,
  ) {}
  async managerSignUp(managerSignInfo: ManagerSignUpDto): Promise<Manager> {
    const existEmail = await this.managerRepository.findOne({
      where: { email: managerSignInfo.email },
    });

    if (existEmail) throw new ConflictException('중복 이메일');
    await this.transformPassword(managerSignInfo);
    const managerInfo = this.managerRepository.create(managerSignInfo);
    return await this.managerRepository.save(managerInfo);
  }

  async transformPassword(managerDto: ManagerSignUpDto): Promise<void> {
    const solt = Number(M_HASHING_SOLT);
    managerDto.password = await bcrypt.hash(managerDto.password, solt);
  }

  async createManagerAccess(payload: ManagerTokenPayload): Promise<string> {
    const managerAccessToken = await this.jwtService.sign(payload, {
      secret: M_ACCESS_SECRET,
      expiresIn: '20m',
    });
    return managerAccessToken;
  }

  async createManagerRefresh(payload: ManagerTokenPayload): Promise<string> {
    const refreshToken = await this.jwtService.sign(payload, {
      secret: M_REFRESH_SECREY,
      expiresIn: '24h',
    });
    return refreshToken;
  }

  async managerLogin(managerLoginDto: ManagerLoginDto) {
    return 'This action adds a new manager';
  }
}
