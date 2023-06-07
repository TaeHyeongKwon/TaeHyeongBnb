import { IsNotEmpty, IsNumberString } from 'class-validator';

export class SendSmsDto {
  @IsNotEmpty()
  @IsNumberString()
  phone_number: string;
}
