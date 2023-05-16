import { Injectable } from '@nestjs/common';
import { CreateHostDto } from './dto/create-host.dto';

@Injectable()
export class HostService {
  create(createHostDto: CreateHostDto) {
    return 'This action adds a new host';
  }
}
