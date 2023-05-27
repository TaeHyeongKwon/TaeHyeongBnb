import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ManagerLoginDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
