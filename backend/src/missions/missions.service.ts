import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
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
import { SearchMissionsDto } from './dto/search-missions.dto';
import { EventsGateway } from '../events/events.gateway';

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
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
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

  /**
   * Advanced search with full-text query + filters
   */
  async search(filters: SearchMissionsDto) {
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

    // Full-text search (title + description)
    if (filters.q && filters.q.trim()) {
      qb.andWhere(
        '(LOWER(mission.title) LIKE LOWER(:q) OR LOWER(mission.description) LIKE LOWER(:q))',
        { q: `%${filters.q.trim()}%` },
      );
    }

    // Filters
    if (filters.category) {
      qb.andWhere('mission.category = :category', {
        category: filters.category,
      });
    }

    if (filters.urgency) {
      qb.andWhere('mission.urgency = :urgency', { urgency: filters.urgency });
    }

    if (filters.status) {
      qb.andWhere('mission.status = :status', { status: filters.status });
    }

    if (filters.visibility) {
      qb.andWhere('mission.visibility = :visibility', {
        visibility: filters.visibility,
      });
    }

    // Geographic filtering (simple SQLite-compatible approach)
    if (filters.lat && filters.lng && filters.radius) {
      // Use bounding box approximation for SQLite (fast but less accurate)
      const latDelta = filters.radius / 111; // 1 degree ≈ 111 km
      const lngDelta = filters.radius / (111 * Math.cos(filters.lat * (Math.PI / 180)));

      qb.andWhere('mission.locationLat IS NOT NULL');
      qb.andWhere('mission.locationLng IS NOT NULL');
      qb.andWhere('mission.locationLat BETWEEN :latMin AND :latMax', {
        latMin: filters.lat - latDelta,
        latMax: filters.lat + latDelta,
      });
      qb.andWhere('mission.locationLng BETWEEN :lngMin AND :lngMax', {
        lngMin: filters.lng - lngDelta,
        lngMax: filters.lng + lngDelta,
      });
    }

    // Sorting (validate sortBy to prevent SQL injection)
    const validSortFields = ['createdAt', 'expiresAt', 'urgency'];
    const sortBy = validSortFields.includes(filters.sortBy || '')
      ? filters.sortBy
      : 'createdAt';
    const sortOrder = filters.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(`mission.${sortBy}`, sortOrder);

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
    const savedMission = await this.missionsRepository.save(mission);

    // Notify creator via WebSocket
    this.eventsGateway.sendToUser(userId, 'mission:created', {
      type: 'mission_created',
      missionId: savedMission.id,
      missionTitle: savedMission.title,
    });

    return savedMission;
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
    if (mission.status === MissionStatus.RESOLUE) {
      throw new ForbiddenException('Mission is already closed');
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

      // Send real-time WebSocket notification
      this.eventsGateway.sendToUser(contrib.userId, 'mission:closed', {
        type: 'mission_closed',
        missionId: id,
        missionTitle: mission.title,
        closureThanks: dto.closureThanks || null,
      });

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

        // Send real-time WebSocket notification for thanks
        this.eventsGateway.sendToUser(contrib.userId, 'thanks:received', {
          type: 'thanks_received',
          missionId: id,
          missionTitle: mission.title,
          message: dto.closureThanks,
        });
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
