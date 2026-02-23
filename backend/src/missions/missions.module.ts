import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from './entities/mission.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import { Correlation } from '../correlations/entities/correlation.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { MissionsService } from './missions.service';
import { MissionsController } from './missions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Mission,
      Contribution,
      Correlation,
      Notification,
    ]),
  ],
  providers: [MissionsService],
  controllers: [MissionsController],
  exports: [MissionsService],
})
export class MissionsModule {}
