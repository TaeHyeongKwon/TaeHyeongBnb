import { IsNotEmpty, IsString } from 'class-validator';

export class CheckEmailDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
