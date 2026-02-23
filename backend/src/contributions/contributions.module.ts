import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contribution } from './entities/contribution.entity';
import { Mission } from '../missions/entities/mission.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { ContributionsService } from './contributions.service';
import { ContributionsController } from './contributions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contribution, Mission, Notification])],
  providers: [ContributionsService],
  controllers: [ContributionsController],
  exports: [ContributionsService],
})
export class ContributionsModule {}
