import { Module, forwardRef } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../entities/reservation.entity';
import { AuthModule } from '../auth/auth.module';
import { HousesModule } from '../houses/houses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation]),
    AuthModule,
    forwardRef(() => HousesModule),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
