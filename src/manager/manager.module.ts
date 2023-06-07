import { Module } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Manager } from '../entities/manager.entity';
import { PassportModule } from '@nestjs/passport';
import { ManagerAccessStrategy } from './jwtmanager/manager.access.strategy';
import { ManagerRefreshStrategy } from './jwtmanager/manager.refresh.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Manager]),
    JwtModule.register({
      secret: process.env.M_ACCESS_SECRET,
      signOptions: { expiresIn: '20m' },
    }),
    JwtModule.register({
      secret: process.env.M_REFRESH_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    PassportModule,
  ],
  exports: [TypeOrmModule, PassportModule, ManagerService],
  controllers: [ManagerController],
  providers: [ManagerService, ManagerAccessStrategy, ManagerRefreshStrategy],
})
export class ManagerModule {}
