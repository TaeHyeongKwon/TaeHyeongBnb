import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class CreateHostDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString()
  birth_date: string;

  @IsNotEmpty()
  @IsNumberString()
  phone_number: number;
}
