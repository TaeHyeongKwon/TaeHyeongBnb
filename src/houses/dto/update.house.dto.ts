import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class UpdateHouseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsString()
  university: string;

  @IsNotEmpty()
  @IsString()
  houseType: string;

  @IsNotEmpty()
  @IsNumberString()
  pricePerDay: number;
}
