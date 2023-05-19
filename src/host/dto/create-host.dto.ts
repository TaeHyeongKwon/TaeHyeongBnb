import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateHostDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString()
  birth_date: string;

  @IsNotEmpty()
  @IsInt()
  phone_number: number;
}
