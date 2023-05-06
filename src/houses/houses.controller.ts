import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { HousesService } from './houses.service';
import { FindAllHouseDto } from './dto/findall.house.dto';
import { CreateHouseDto } from './dto/create.house.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'common/multerOption';

@Controller('houses')
export class HousesController {
  constructor(private readonly housesService: HousesService) {}

  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  @Get('/list')
  async findHouseList(@Query() findAllHouseDto: FindAllHouseDto) {
    return await this.housesService.findHouseList(findAllHouseDto);
  }

  @Post('/')
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions as any))
  @UsePipes(ValidationPipe)
  async createHouse(
    @Body() createHouseDto: CreateHouseDto,
    @UploadedFiles() files: Array<Express.MulterS3.File>,
  ) {
    await this.housesService.createHouse(createHouseDto, files);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findHouse(@Param('id') id: number) {
    return await this.housesService.findHouse(id);
  }
}
