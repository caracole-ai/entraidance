import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from '../missions/entities/mission.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { MissionExpirationCron } from './mission-expiration.cron';

@Module({
  imports: [TypeOrmModule.forFeature([Mission, Notification])],
  providers: [MissionExpirationCron],
})
export class CronsModule {}
