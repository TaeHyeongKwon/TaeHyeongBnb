import { IsNotEmpty, IsNumberString } from 'class-validator';

export class GetHostListDto {
  @IsNotEmpty()
  @IsNumberString()
  page: string;
}
