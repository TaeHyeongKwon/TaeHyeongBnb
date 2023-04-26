import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { HousesService } from './houses.service';
import { FindAllHouseDto } from './dto/findall.house.dto';

@Controller('houses')
export class HousesController {
  constructor(private readonly housesService: HousesService) {}

  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  @Get('/list')
  async findHouseList(@Query() findAllHouseDto: FindAllHouseDto) {
    return await this.housesService.findHouseList(findAllHouseDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findHouse(@Param('id') id: number) {
    return await this.housesService.findHouse(id);
  }
}
