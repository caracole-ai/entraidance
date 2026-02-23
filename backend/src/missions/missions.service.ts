import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from './entities/mission.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import { Correlation } from '../correlations/entities/correlation.entity';
import { Notification } from '../notifications/entities/notification.entity';
import {
  MissionStatus,
  NotificationType,
  ReferenceType,
  ContributionStatus,
} from '../shared/enums';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { CloseMissionDto } from './dto/close-mission.dto';
import { MissionFiltersDto } from './dto/mission-filters.dto';

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission)
    private readonly missionsRepository: Repository<Mission>,
    @InjectRepository(Contribution)
    private readonly contributionsRepository: Repository<Contribution>,
    @InjectRepository(Correlation)
    private readonly correlationsRepository: Repository<Correlation>,
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async findAll(filters: MissionFiltersDto) {
    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(Math.max(filters.limit || 20, 1), 100);
    const skip = (page - 1) * limit;

    const qb = this.missionsRepository
      .createQueryBuilder('mission')
      .leftJoinAndSelect('mission.creator', 'creator')
      .select([
        'mission',
        'creator.id',
        'creator.displayName',
        'creator.avatarUrl',
      ]);

    if (filters.category) {
      qb.andWhere('mission.category = :category', {
        category: filters.category,
      });
    }

    if (filters.helpType) {
      qb.andWhere('mission.helpType = :helpType', {
        helpType: filters.helpType,
      });
    }

    if (filters.urgency) {
      qb.andWhere('mission.urgency = :urgency', { urgency: filters.urgency });
    }

    if (filters.status) {
      qb.andWhere('mission.status = :status', { status: filters.status });
    }

    if (filters.tags) {
      const tagsArray = filters.tags.split(',').map((t) => t.trim());
      for (let i = 0; i < tagsArray.length; i++) {
        qb.andWhere(`mission.tags LIKE :tag${i}`, {
          [`tag${i}`]: `%${tagsArray[i]}%`,
        });
      }
    }

    if (filters.search) {
      qb.andWhere(
        '(LOWER(mission.title) LIKE LOWER(:search) OR LOWER(mission.description) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    // Geo filtering: use PostGIS when available, skip on SQLite
    if (
      filters.lat &&
      filters.lng &&
      filters.radiusKm &&
      process.env.DB_TYPE === 'postgres'
    ) {
      qb.andWhere(
        `ST_DWithin(
          ST_SetSRID(ST_MakePoint(mission.locationLng, mission.locationLat), 4326)::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radius
        )`,
        {
          lng: filters.lng,
          lat: filters.lat,
          radius: filters.radiusKm * 1000,
        },
      );
    }

    qb.orderBy('mission.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findOne(id: string): Promise<Mission | null> {
    return this.missionsRepository.findOne({
      where: { id },
      relations: ['creator', 'contributions'],
    });
  }

  async create(userId: string, dto: CreateMissionDto): Promise<Mission> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const mission = this.missionsRepository.create({
      ...dto,
      creatorId: userId,
      tags: dto.tags || [],
      expiresAt,
    });
    return this.missionsRepository.save(mission);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateMissionDto,
  ): Promise<Mission> {
    const mission = await this.missionsRepository.findOneBy({ id });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }
    if (mission.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can update this mission');
    }

    await this.missionsRepository.update(id, dto);
    return this.missionsRepository.findOneOrFail({
      where: { id },
      relations: ['creator'],
    });
  }

  async close(
    id: string,
    userId: string,
    dto: CloseMissionDto,
  ): Promise<Mission> {
    const mission = await this.missionsRepository.findOneBy({ id });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }
    if (mission.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can close this mission');
    }

    await this.missionsRepository.update(id, {
      status: MissionStatus.RESOLUE,
      closedAt: new Date(),
      closureFeedback: dto.closureFeedback || null,
      closureThanks: dto.closureThanks || null,
    });

    // Notify all contributors
    const contributions = await this.contributionsRepository.find({
      where: { missionId: id, status: ContributionStatus.ACTIVE },
    });

    for (const contrib of contributions) {
      const notification = this.notificationsRepository.create({
        userId: contrib.userId,
        type: NotificationType.MISSION_CLOSED,
        title: `Mission "${mission.title}" has been resolved`,
        body: dto.closureThanks || null,
        referenceType: ReferenceType.MISSION,
        referenceId: id,
      });
      await this.notificationsRepository.save(notification);

      // Send additional THANKS_RECEIVED notification if creator wrote a thanks message
      if (dto.closureThanks) {
        const thanksNotification = this.notificationsRepository.create({
          userId: contrib.userId,
          type: NotificationType.THANKS_RECEIVED,
          title: `You received thanks for mission "${mission.title}"`,
          body: dto.closureThanks,
          referenceType: ReferenceType.MISSION,
          referenceId: id,
        });
        await this.notificationsRepository.save(thanksNotification);
      }
    }

    return this.missionsRepository.findOneOrFail({
      where: { id },
      relations: ['creator'],
    });
  }

  getContributions(missionId: string): Promise<Contribution[]> {
    return this.contributionsRepository.find({
      where: { missionId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  getCorrelations(missionId: string): Promise<Correlation[]> {
    return this.correlationsRepository.find({
      where: { missionId },
      relations: ['offer', 'offer.creator'],
      order: { score: 'DESC' },
    });
  }
}
