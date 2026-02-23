import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MissionsModule } from './missions/missions.module';
import { ContributionsModule } from './contributions/contributions.module';
import { OffersModule } from './offers/offers.module';
import { CorrelationsModule } from './correlations/correlations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MatchingModule } from './matching/matching.module';
import { CronsModule } from './crons/crons.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: 60000, limit: 20 },
        { name: 'long', ttl: 600000, limit: 100 },
      ],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    MissionsModule,
    ContributionsModule,
    OffersModule,
    CorrelationsModule,
    NotificationsModule,
    MatchingModule,
    CronsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
