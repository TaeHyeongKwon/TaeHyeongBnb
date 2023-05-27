import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerLoginDto } from './dto/manager.login.dto';
import { ManagerSignUpDto } from './dto/manager.signup.dto';
import { Response } from 'express';
const { M_SIGNUP_URI, M_LOGIN_URI } = process.env;

@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Post(M_SIGNUP_URI)
  @UsePipes(ValidationPipe)
  async managerSignUp(@Body() managerSignUpDto: ManagerSignUpDto) {
    return await this.managerService.managerSignUp(managerSignUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post(M_LOGIN_URI)
  @UsePipes(ValidationPipe)
  async managerLogin(
    @Body() managerLoginDto: ManagerLoginDto,
    @Res() res: Response,
  ) {
    const managerJwt = await this.managerService.managerLogin(managerLoginDto);

    res.setHeader('Authorizetion', 'Bearer ' + managerJwt.managerAccessToken);
    res.cookie('refresh', managerJwt.managerRefreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ msg: '관리자 로그인' });
  }
}
