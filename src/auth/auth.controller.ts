import {
  Controller,
  Post,
  Body,
  Res,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { Payload } from './jwt/jwt.payload.interface';
import { RefreshTokenGuard } from './jwt/refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/sign-up')
  @UsePipes(ValidationPipe)
  async register(
    @Body() userInfo: SignUpDto,
    @Res() res: Response,
  ): Promise<Response> {
    await this.authService.register(userInfo);
    return res.json({ msg: '회원가입 성공' });
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  @UsePipes(ValidationPipe)
  async login(
    @Body() userInfo: LoginDto,
    @Res() res: Response,
  ): Promise<Response> {
    const jwt = await this.authService.validateUser(userInfo);

    res.setHeader('Authorizetion', 'Bearer ' + jwt.accessToken);
    res.cookie('refresh', jwt.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.json({ msg: '로그인 성공' });
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/refresh-token')
  async ckeckRefresh(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const user: any = req.user;
    const payload: Payload = { id: user.id, nickname: user.nickname };
    const newJwt = await this.authService.createAccessToken(payload);

    res.setHeader('Authorizetion', 'Bearer ' + newJwt);

    return res.json({ msg: '토큰 재발급' });
  }
}
