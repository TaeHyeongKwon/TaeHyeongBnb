import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHouseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  university: string;

  @IsNotEmpty()
  @IsString()
  houseType: string;

  @IsNotEmpty()
  @IsString()
  pricePerDay: number;
}
