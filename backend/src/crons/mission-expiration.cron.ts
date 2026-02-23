import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { Mission } from '../missions/entities/mission.entity';
import { Notification } from '../notifications/entities/notification.entity';
import {
  MissionStatus,
  NotificationType,
  ReferenceType,
} from '../shared/enums';

@Injectable()
export class MissionExpirationCron {
  private readonly logger = new Logger(MissionExpirationCron.name);

  constructor(
    @InjectRepository(Mission)
    private readonly missionsRepository: Repository<Mission>,
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiration() {
    const now = new Date();

    const expiredMissions = await this.missionsRepository.find({
      where: {
        status: MissionStatus.OUVERTE,
        expiresAt: LessThan(now),
      },
    });

    for (const mission of expiredMissions) {
      await this.missionsRepository.update(mission.id, {
        status: MissionStatus.EXPIREE,
      });

      const notification = this.notificationsRepository.create({
        userId: mission.creatorId,
        type: NotificationType.MISSION_EXPIRED,
        title: `Your mission "${mission.title}" has expired`,
        body: 'The mission reached its 30-day limit without being resolved.',
        referenceType: ReferenceType.MISSION,
        referenceId: mission.id,
      });
      await this.notificationsRepository.save(notification);
    }

    if (expiredMissions.length > 0) {
      this.logger.log(`Expired ${expiredMissions.length} missions`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleReminder() {
    const now = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(now.getDate() + 5);

    const nextDay = new Date(fiveDaysFromNow);
    nextDay.setDate(nextDay.getDate() + 1);

    const expiringMissions = await this.missionsRepository.find({
      where: {
        status: MissionStatus.OUVERTE,
        expiresAt: Between(fiveDaysFromNow, nextDay),
      },
    });

    for (const mission of expiringMissions) {
      const notification = this.notificationsRepository.create({
        userId: mission.creatorId,
        type: NotificationType.MISSION_EXPIRING,
        title: `Your mission "${mission.title}" expires in 5 days`,
        body: 'Consider closing or updating your mission before it expires.',
        referenceType: ReferenceType.MISSION,
        referenceId: mission.id,
      });
      await this.notificationsRepository.save(notification);
    }

    if (expiringMissions.length > 0) {
      this.logger.log(
        `Sent reminders for ${expiringMissions.length} expiring missions`,
      );
    }
  }
}
