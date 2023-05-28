import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ManagerLoginDto } from './dto/manager.login.dto';
import { ManagerSignUpDto } from './dto/manager.signup.dto';
import { Manager } from '../entities/manager.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManagerTokenPayload } from './jwtmanager/m.jwt.payload.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const { M_ACCESS_SECRET, M_REFRESH_SECREY, M_HASHING_SOLT } = process.env;

@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(Manager) private managerRepository: Repository<Manager>,
    private jwtService: JwtService,
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

  async managerLogin(
    managerLoginDto: ManagerLoginDto,
  ): Promise<{ managerAccessToken: string; managerRefreshToken: string }> {
    const existManager = await this.managerRepository.findOne({
      where: { email: managerLoginDto.email },
    });

    if (!existManager) throw new NotFoundException('email을 확인해 주세요.');

    const validatePassword = await bcrypt.compare(
      managerLoginDto.password,
      existManager.password,
    );

    if (!validatePassword)
      throw new BadRequestException('password를 확인해 주세요');

    const payload: ManagerTokenPayload = {
      id: existManager.id,
      name: existManager.name,
    };

    const managerAccessToken: string = await this.createManagerAccess(payload);

    const managerRefreshToken: string = await this.createManagerRefresh(
      payload,
    );

    return { managerAccessToken, managerRefreshToken };
  }

  async tokenValidateManager(payload: ManagerTokenPayload) {
    return await this.managerRepository.findOne({
      where: { id: payload.id },
      select: ['id', 'name'],
    });
  }
}
