import { Module } from '@nestjs/common';
import { HostService } from './host.service';
import { HostController } from './host.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Host } from '../entities/host.entity';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([Host]),
    AuthModule,
    HttpModule,
    CacheModule.register(),
  ],
  controllers: [HostController],
  providers: [HostService],
  exports: [HostService],
})
export class HostModule {}
