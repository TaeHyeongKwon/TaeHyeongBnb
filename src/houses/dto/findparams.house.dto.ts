import { IsNotEmpty, IsNumberString } from 'class-validator';

export class ImageQueryKeyDto {
  @IsNotEmpty()
  @IsNumberString()
  key: number;
}
