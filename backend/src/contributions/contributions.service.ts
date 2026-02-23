import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contribution } from './entities/contribution.entity';
import { Mission } from '../missions/entities/mission.entity';
import { Notification } from '../notifications/entities/notification.entity';
import {
  ContributionStatus,
  NotificationType,
  ReferenceType,
} from '../shared/enums';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(Contribution)
    private readonly contributionsRepository: Repository<Contribution>,
    @InjectRepository(Mission)
    private readonly missionsRepository: Repository<Mission>,
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  findByMission(missionId: string): Promise<Contribution[]> {
    return this.contributionsRepository.find({
      where: { missionId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  findByUser(userId: string): Promise<Contribution[]> {
    return this.contributionsRepository.find({
      where: { userId },
      relations: ['mission'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    userId: string,
    missionId: string,
    dto: CreateContributionDto,
  ): Promise<Contribution> {
    const mission = await this.missionsRepository.findOneBy({ id: missionId });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    const contribution = this.contributionsRepository.create({
      userId,
      missionId,
      type: dto.type,
      message: dto.message || null,
    });
    const saved = await this.contributionsRepository.save(contribution);

    // Notify mission creator
    const notification = this.notificationsRepository.create({
      userId: mission.creatorId,
      type: NotificationType.NEW_CONTRIBUTION,
      title: `New contribution on "${mission.title}"`,
      body: dto.message || null,
      referenceType: ReferenceType.MISSION,
      referenceId: missionId,
    });
    await this.notificationsRepository.save(notification);

    return saved;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateContributionDto,
  ): Promise<Contribution> {
    const contribution = await this.contributionsRepository.findOneBy({ id });
    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }
    if (contribution.userId !== userId) {
      throw new ForbiddenException('Only the contribution owner can update it');
    }

    await this.contributionsRepository.update(id, dto);
    return this.contributionsRepository.findOneOrFail({
      where: { id },
      relations: ['user', 'mission'],
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const contribution = await this.contributionsRepository.findOneBy({ id });
    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }
    if (contribution.userId !== userId) {
      throw new ForbiddenException('Only the contribution owner can remove it');
    }

    await this.contributionsRepository.update(id, {
      status: ContributionStatus.ANNULEE,
    });
  }
}
