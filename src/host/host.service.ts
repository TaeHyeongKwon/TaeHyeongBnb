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
      console.error(err);
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

  //SMS보내기
  async sendSms(sendSmsDto: SendSmsDto) {
    const timestamp = Date.now().toString();

    //헤더의 시그니처 생성
    const signature: string = this.makeSignature(timestamp);

    //인증을 진행할 난수 생성
    const code: string = this.createRandomNum().toString();

    //네이버sens 오픈API의 헤더 요구사항
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'x-ncp-apigw-timestamp': timestamp,
      'x-ncp-iam-access-key': NAVER_API_ACCESS_KEY_ID,
      'x-ncp-apigw-signature-v2': signature,
    };

    //네이버sens 오픈API의 데이터 필수 요구사항
    const body = {
      type: 'SMS',
      from: SMS_CALLING_NUMBER,
      content: `인증번호는 ${code}입니다.`,
      messages: [{ to: sendSmsDto.phone_number }],
    };

    //네이버sens 오픈API의 요청 URL
    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${NAVER_SMS_SERVICE_ID}/messages`;

    //axios요청으로 네이버sens SMS 보내기
    await firstValueFrom(this.http.post(url, body, { headers })).catch((e) => {
      console.error(e);
      throw new HttpException('네이버 SENS SMS전송 axios 에러', 500);
    });

    //혹시 이미 존재할 동일 key의 캐시데이터 삭제
    await this.cacheManager.del('BnbPhoneNumberCheckCode');

    //캐시에 인증code 저장 3분간
    await this.cacheManager.set('BnbPhoneNumberCheckCode', code, 180000);
  }

  //SMS인증 코드 확인
  async checkSms(checkSmsDto: CheckSmsDto): Promise<boolean> {
    //캐시에 저장된 인증code를 변수에 담기
    const certificationCode = await this.cacheManager.get(
      'BnbPhoneNumberCheckCode',
    );

    //인증code와 입력된code를 비교해서 처리
    if (certificationCode !== checkSmsDto.checkCode)
      throw new BadRequestException('인증 코드가 일치하지 않습니다.');
    return true;
  }

  //호스트 신청 리스트 최신순으로 뽑아주기,
  async getHostList(getHostListDto: GetHostListDto) {
    if (!getHostListDto.page) getHostListDto.page = '1';
    return await this.hostRepository.find({
      order: { id: 'DESC' },
      skip: 20 * (Number(getHostListDto.page) - 1),
      take: 20,
    });
  }

  //호스트 신청 승인
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
      //신청 승인을 false에서 true로 업데이트
      await queryRunner.manager.update(Host, { id }, { approval: true });
      //User테이블의 인증항목 또한 true로 업데이트
      await queryRunner.manager.update(
        User,
        { id: existApproval.userId },
        { host_certification: true },
      );
      await queryRunner.commitTransaction();
      return { msg: '승인 완료' };
    } catch (err) {
      console.error(err);
      await queryRunner.rollbackTransaction();
      throw new HttpException('호스트 인증 트랜잭션 롤백 에러', 500);
    } finally {
      await queryRunner.release();
    }
  }
}
