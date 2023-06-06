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
import { ReviewModule } from './review/review.module';
import { Review } from './entities/review.entity';
import { CommentModule } from './comment/comment.module';
import { Comment } from './entities/comment.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { Authentication } from './entities/authentication.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        User,
        House,
        Reservation,
        Host,
        Manager,
        Review,
        Comment,
        Authentication,
      ],
      synchronize: true,
    }),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.naver.com',
          port: 587,
          auth: {
            user: `${process.env.EMAILADDRESS}`,
            pass: `${process.env.EMAILPASSWORD}`,
          },
        },
        defaults: {
          from: `'TaeHyeongBNB' <${process.env.EMAILADDRESS}>`,
        },
      }),
    }),
    AuthModule,
    HousesModule,
    ReservationsModule,
    HostModule,
    ManagerModule,
    ReviewModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
