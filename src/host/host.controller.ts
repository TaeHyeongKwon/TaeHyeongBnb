import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { HostService } from './host.service';
import { CreateHostDto } from './dto/create-host.dto';
import { GetUser } from 'common/decorator/get.user.decorator';
import { User } from '../entities/user.entity';
import { AccessTokenGuard } from '../auth/jwt/access.guard';
import { SendSmsDto } from './dto/send-sms.dto';
import { CheckSmsDto } from './dto/check-sms.dto';
import { ManagerAccessGuard } from 'src/manager/jwtmanager/manager.access.guard';
import { GetHostListDto } from './dto/get-hostlist.dto';

@Controller('host')
export class HostController {
  constructor(private readonly hostService: HostService) {}

  @Post('/')
  @UsePipes(ValidationPipe)
  @UseGuards(AccessTokenGuard)
  async createHost(
    @GetUser() user: User,
    @Body() createHostDto: CreateHostDto,
  ) {
    const userId = user.id;
    return await this.hostService.createHost(userId, createHostDto);
  }

  @Post('/send-sms')
  @UsePipes(ValidationPipe)
  @UseGuards(AccessTokenGuard)
  async sendSms(@Body() sendSmsDto: SendSmsDto) {
    return await this.hostService.sendSms(sendSmsDto);
  }

  @Post('/check-sms')
  @UsePipes(ValidationPipe)
  @UseGuards(AccessTokenGuard)
  async checkSms(@Body() checkSmsDto: CheckSmsDto) {
    return await this.hostService.checkSms(checkSmsDto);
  }

  @Get('/list')
  @UseGuards(ManagerAccessGuard)
  async getHostList(@Query() query: GetHostListDto) {
    return await this.hostService.getHostList(query);
  }
}
