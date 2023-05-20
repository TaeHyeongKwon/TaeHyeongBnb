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
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { HousesService } from './houses.service';
import { FindAllHouseDto } from './dto/findall.house.dto';
import { CreateHouseDto } from './dto/create.house.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'common/multerOption';
import { AccessTokenGuard } from 'src/auth/jwt/access.guard';
import { GetUser } from 'common/decorator/get.user.decorator';
import { User } from '../entities/user.entity';

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
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions as any))
  @UsePipes(ValidationPipe)
  async createHouse(
    @Body() createHouseDto: CreateHouseDto,
    @GetUser() user: User,
    @UploadedFiles() files: Array<Express.MulterS3.File>,
  ) {
    await this.housesService.createHouse(user, createHouseDto, files);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findHouse(@Param('id') id: number) {
    return await this.housesService.findHouse(id);
  }
}
