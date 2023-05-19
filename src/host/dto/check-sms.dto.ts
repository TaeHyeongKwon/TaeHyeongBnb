import { IsNotEmpty, IsNumberString } from 'class-validator';

export class CheckSmsDto {
  @IsNotEmpty()
  @IsNumberString()
  checkCode: string;
}
