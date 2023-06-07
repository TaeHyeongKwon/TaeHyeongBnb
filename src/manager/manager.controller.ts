import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerLoginDto } from './dto/manager.login.dto';
import { ManagerSignUpDto } from './dto/manager.signup.dto';
import { Response } from 'express';
import { ManagerRefreshGuard } from './jwtmanager/manager.refresh.guard';
import { GetUser } from 'common/decorator/get.user.decorator';
import { Manager } from 'src/entities/manager.entity';
import { ManagerTokenPayload } from './jwtmanager/m.jwt.payload.interface';
const { M_SIGNUP_URI, M_LOGIN_URI, M_REFRESH_URI } = process.env;

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

  @UseGuards(ManagerRefreshGuard)
  @Post(M_REFRESH_URI)
  async checkManagerRefresh(@GetUser() user: Manager, @Res() res: Response) {
    const id = user.id;
    const payload: ManagerTokenPayload = { id, name: user.name };
    const newManagerAccess = await this.managerService.createManagerAccess(
      payload,
    );

    res.setHeader('Authorizetion', 'Bearer ' + newManagerAccess);
    return res.json({ msg: '관리자 토큰 재발급' });
  }
}
