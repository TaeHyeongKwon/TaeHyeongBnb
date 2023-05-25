import { config } from 'dotenv';
config();
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { House } from './entities/house.entity';
import { Reservation } from './entities/reservation.entity';
import { HousesModule } from './houses/houses.module';
import { ReservationsModule } from './reservations/reservations.module';
import { HostModule } from './host/host.module';
import { Host } from './entities/host.entity';
import { ManagerModule } from './manager/manager.module';
import { Manager } from './entities/manager.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, House, Reservation, Host, Manager],
      synchronize: true,
    }),
    AuthModule,
    HousesModule,
    ReservationsModule,
    HostModule,
    ManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
