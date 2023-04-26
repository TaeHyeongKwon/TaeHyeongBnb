import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsString()
  check_in: string;

  @IsNotEmpty()
  @IsString()
  check_out: string;
}
