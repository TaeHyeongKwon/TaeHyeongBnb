import { Controller, Post, Body } from '@nestjs/common';
import { HostService } from './host.service';
import { CreateHostDto } from './dto/create-host.dto';

@Controller('host')
export class HostController {
  constructor(private readonly hostService: HostService) {}

  @Post()
  create(@Body() createHostDto: CreateHostDto) {
    return this.hostService.create(createHostDto);
  }
}
