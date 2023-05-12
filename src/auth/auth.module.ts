import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { UserService } from './user.service';
import { AccessStrategy } from './jwt/access.strategy';
import { PassportModule } from '@nestjs/passport';
import { RefreshStrategy } from './jwt/refresh.strategy';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.ACCESS_JWT_SECRET,
      signOptions: { expiresIn: '5m' },
    }),
    JwtModule.register({
      secret: process.env.REFRESH_JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    PassportModule,
    HttpModule,
  ],
  exports: [TypeOrmModule, AccessStrategy, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, UserService, AccessStrategy, RefreshStrategy],
})
export class AuthModule {}
