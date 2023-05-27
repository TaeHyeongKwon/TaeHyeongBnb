import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerLoginDto } from './dto/manager.login.dto';
import { ManagerSignUpDto } from './dto/manager.signup.dto';
const { M_SIGNUP_URI } = process.env;

@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Post(M_SIGNUP_URI)
  @UsePipes(ValidationPipe)
  managerSignUp(@Body() managerSignUpDto: ManagerSignUpDto) {
    return this.managerService.managerSignUp(managerSignUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post()
  @UsePipes(ValidationPipe)
  managerLogin(@Body() managerLoginDto: ManagerLoginDto) {
    return this.managerService.managerLogin(managerLoginDto);
  }
}
