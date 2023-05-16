import { Module } from '@nestjs/common';
import { HostService } from './host.service';
import { HostController } from './host.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Host } from '../entities/host.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Host])],
  controllers: [HostController],
  providers: [HostService],
  exports: [HostService],
})
export class HostModule {}
