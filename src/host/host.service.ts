import {
  BadRequestException,
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHostDto } from './dto/create-host.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Host } from '../entities/host.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SendSmsDto } from './dto/send-sms.dto';
import * as CryptoJS from 'crypto-js';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CheckSmsDto } from './dto/check-sms.dto';
import { GetHostListDto } from './dto/get-hostlist.dto';
const {
  NAVER_API_ACCESS_KEY_ID,
  NAVER_API_SECRET_KEY,
  NAVER_SMS_SERVICE_ID,
  SMS_CALLING_NUMBER,
} = process.env;

@Injectable()
export class HostService {
  constructor(
    @InjectRepository(Host) private hostRepository: Repository<Host>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private dataSource: DataSource,
    private http: HttpService,
  ) {}
  async createHost(userId, createHostDto: CreateHostDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existHost = await this.hostRepository.findOne({
        where: { userId },
      });
      if (existHost) throw new ConflictException('이미 등록한 호스트');
      const hostInfo = await this.hostRepository.create({
        userId,
        ...createHostDto,
      });
      //호스트 정보를 저장
      await queryRunner.manager.save(hostInfo);
      //호스트 정보가 저장되면, user테이블의 host_certification컬럼을 false로 업데이트
      await queryRunner.manager.update(
        User,
        { id: hostInfo.userId },
        { host_certification: false },
      );
      await queryRunner.commitTransaction();
      return;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new HttpException('호스트 등록 트랜잭션 롤백 에러', 500);
    } finally {
      await queryRunner.release();
    }
  }

  //인증 코드 생성 함수
  createRandomNum(): number {
    const randNum = Math.floor(100000 + Math.random() * 900000);
    return randNum;
  }

  //SENS의 시그니처 제작함수(최신버전의 crypto-js 4.1.1)
  makeSignature(timestamp): string {
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';
    const url = `/sms/v2/services/${NAVER_SMS_SERVICE_ID}/messages`;
    const accessKey = NAVER_API_ACCESS_KEY_ID;
    const secretKey = NAVER_API_SECRET_KEY;

    const massage =
      method + space + url + newLine + timestamp + newLine + accessKey;
    const hmac = CryptoJS.HmacSHA256(massage, secretKey);
    const hash = hmac.toString(CryptoJS.enc.Base64);
    return hash;
  }

  //SENS의 시그니처 제작함수(샘플버전의 crypto-js v3.1.2)
  // makeSignature(timestamp) {
  //   const space = ' ';
  //   const newLine = '\n';
  //   const method = 'POST';
  //   const url = `/sms/v2/services/${NAVER_SMS_SERVICE_ID}/messages`;
  //   const accessKey = NAVER_API_ACCESS_KEY_ID;
  //   const secretKey = NAVER_API_SECRET_KEY;

  //   const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
  //   hmac.update(method);
  //   hmac.update(space);
  //   hmac.update(url);
  //   hmac.update(newLine);
  //   hmac.update(timestamp);
  //   hmac.update(newLine);
  //   hmac.update(accessKey);

  //   const hash = hmac.finalize();

  //   return hash.toString(CryptoJS.enc.Base64);
  // }

  async sendSms(sendSmsDto: SendSmsDto) {
    const timestamp = Date.now().toString();
    const signature: string = this.makeSignature(timestamp);
    const code: string = this.createRandomNum().toString();
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'x-ncp-apigw-timestamp': timestamp,
      'x-ncp-iam-access-key': NAVER_API_ACCESS_KEY_ID,
      'x-ncp-apigw-signature-v2': signature,
    };

    const body = {
      type: 'SMS',
      from: SMS_CALLING_NUMBER,
      content: `인증번호는 ${code}입니다.`,
      messages: [{ to: sendSmsDto.phone_number }],
    };

    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${NAVER_SMS_SERVICE_ID}/messages`;

    await firstValueFrom(this.http.post(url, body, { headers })).catch(() => {
      throw new HttpException('네이버 SENS SMS전송 axios 에러', 500);
    });

    await this.cacheManager.del('BnbPhoneNumberCheckCode');
    await this.cacheManager.set('BnbPhoneNumberCheckCode', code, 180000);
  }

  async checkSms(checkSmsDto: CheckSmsDto): Promise<boolean> {
    const certificationCode = await this.cacheManager.get(
      'BnbPhoneNumberCheckCode',
    );

    if (certificationCode !== checkSmsDto.checkCode)
      throw new BadRequestException('인증 코드가 일치하지 않습니다.');
    return true;
  }

  async getHostList(getHostListDto: GetHostListDto) {
    if (!getHostListDto.page) getHostListDto.page = '1';
    return await this.hostRepository.find({
      order: { id: 'DESC' },
      skip: 20 * (Number(getHostListDto.page) - 1),
      take: 20,
    });
  }

  async updateHostApproval(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existApproval = await this.hostRepository.findOne({
        where: { id },
      });
      if (!existApproval)
        throw new NotFoundException('존재하지 않는 호스트 신청');
      await queryRunner.manager.update(Host, { id }, { approval: true });
      await queryRunner.manager.update(
        User,
        { id: existApproval.userId },
        { host_certification: true },
      );
      await queryRunner.commitTransaction();
      return { msg: '승인 완료' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) throw err;
      throw new HttpException('호스트 인증 트랜잭션 롤백 에러', 500);
    } finally {
      await queryRunner.release();
    }
  }
}
