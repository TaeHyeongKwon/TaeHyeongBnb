import { IsEnum, IsNumberString } from 'class-validator';

export enum ListSort {
  ASC = 'ASC',
  DESC = 'DESC',
}
export class FindAllHouseDto {
  @IsNumberString()
  page: string;

  @IsEnum(ListSort)
  sort: ListSort;
}
