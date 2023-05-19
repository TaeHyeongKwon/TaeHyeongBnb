import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { HostService } from './host.service';
import { CreateHostDto } from './dto/create-host.dto';
import { GetUser } from 'common/decorator/get.user.decorator';
import { User } from '../entities/user.entity';
import { AccessTokenGuard } from '../auth/jwt/access.guard';
import { SendSmsDto } from './dto/send-sms.dto';
import { CheckSmsDto } from './dto/check-sms.dto';

@Controller('host')
@UseGuards(AccessTokenGuard)
export class HostController {
  constructor(private readonly hostService: HostService) {}

  @Post('/')
  @UsePipes(ValidationPipe)
  createHost(@GetUser() user: User, @Body() createHostDto: CreateHostDto) {
    const userId = user.id;
    return this.hostService.createHost(userId, createHostDto);
  }

  @Post('/send-sms')
  @UsePipes(ValidationPipe)
  sendSms(@Body() sendSmsDto: SendSmsDto) {
    return this.hostService.sendSms(sendSmsDto);
  }

  @Post('/check-sms')
  @UsePipes(ValidationPipe)
  checkSms(@Body() checkSmsDto: CheckSmsDto) {
    return this.hostService.checkSms(checkSmsDto);
  }
}
