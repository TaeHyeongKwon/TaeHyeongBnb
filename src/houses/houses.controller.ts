import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { UpdateHouseDto } from './dto/update.house.dto';
import { ImageQueryKeyDto } from './dto/findparams.house.dto';

@Controller('houses')
export class HousesController {
  constructor(private readonly housesService: HousesService) {}

  //숙소 리스트 조회
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  @Get('/list')
  async findHouseList(@Query() findAllHouseDto: FindAllHouseDto) {
    return await this.housesService.findHouseList(findAllHouseDto);
  }

  //숙소 등록하기
  @Post('/')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('images', 5, multerOptions as any))
  @UsePipes(ValidationPipe)
  async createHouse(
    @Body() createHouseDto: CreateHouseDto,
    @GetUser() user: User,
    @UploadedFiles() files: Array<Express.MulterS3.File>,
  ) {
    await this.housesService.createHouse(user, createHouseDto, files);
  }

  //숙소 상세조회
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findHouse(@Param('id') id: number) {
    return await this.housesService.findHouse(id);
  }

  //등록했던 숙소 내용 불러오기(수정하러 가기 버튼)
  @Get('update/:id')
  @UseGuards(AccessTokenGuard)
  @UsePipes(ValidationPipe)
  async getWrittenHouseDetail(@GetUser() user: User, @Param('id') id: number) {
    const userId = user.id;
    return await this.housesService.getWrittenHouseDetail(userId, id);
  }

  //숙소 내용 수정하기(수정완료 버튼)
  //등록된 이미지가 5개를 넘으면 수 없음
  @Put(':id')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('images', 5, multerOptions as any))
  @UsePipes(ValidationPipe)
  async updateHouse(
    @Param('id') id: number,
    @Body() updateHouseDto: UpdateHouseDto,
    @GetUser() user: User,
    @UploadedFiles() files: Array<Express.MulterS3.File>,
  ) {
    return await this.housesService.updateHouse(
      id,
      user,
      updateHouseDto,
      files,
    );
  }

  //등록했던 이미지 삭제하기 API
  @Delete('image/:id')
  @UseGuards(AccessTokenGuard)
  @UsePipes(ValidationPipe)
  async deleteImage(
    @Query() query: ImageQueryKeyDto,
    @Param('id') id: number,
    @GetUser() user: User,
  ) {
    await this.housesService.deleteImage(id, Number(query.key), user.id);
  }
}
