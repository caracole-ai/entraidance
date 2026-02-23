import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import { Offer } from '../offers/entities/offer.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { MissionStatus } from '../shared/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Mission)
    private readonly missionsRepository: Repository<Mission>,
    @InjectRepository(Contribution)
    private readonly contributionsRepository: Repository<Contribution>,
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findByOAuthProvider(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    return this.usersRepository.findOneBy({
      oauthProvider: provider,
      oauthProviderId: providerId,
    });
  }

  create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, data);
    return this.findOne(id);
  }

  getUserMissions(userId: string): Promise<Mission[]> {
    return this.missionsRepository.find({
      where: { creatorId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  getUserContributions(userId: string): Promise<Contribution[]> {
    return this.contributionsRepository.find({
      where: { userId },
      relations: ['mission'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteAccount(userId: string): Promise<void> {
    // Delete user data in order (respect FK constraints)
    await this.notificationsRepository.delete({ userId });
    await this.contributionsRepository.delete({ userId });
    // Delete contributions on user's missions
    const userMissions = await this.missionsRepository.find({
      where: { creatorId: userId },
      select: ['id'],
    });
    for (const mission of userMissions) {
      await this.contributionsRepository.delete({ missionId: mission.id });
    }
    await this.missionsRepository.delete({ creatorId: userId });
    await this.offersRepository.delete({ creatorId: userId });
    await this.usersRepository.delete(userId);
  }

  async exportUserData(userId: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    const missions = await this.missionsRepository.find({
      where: { creatorId: userId },
    });
    const contributions = await this.contributionsRepository.find({
      where: { userId },
      relations: ['mission'],
    });
    const offers = await this.offersRepository.find({
      where: { creatorId: userId },
    });

    // Strip sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, oauthProviderId, ...safeUser } = user || ({} as any);

    return {
      user: safeUser,
      missions,
      contributions,
      offers,
      exportedAt: new Date().toISOString(),
    };
  }

  async getUserStats(userId: string) {
    const missionsCreated = await this.missionsRepository.count({
      where: { creatorId: userId },
    });
    const missionsResolved = await this.missionsRepository.count({
      where: { creatorId: userId, status: MissionStatus.RESOLUE },
    });
    const contributionsGiven = await this.contributionsRepository.count({
      where: { userId },
    });
    const offersCreated = await this.offersRepository.count({
      where: { creatorId: userId },
    });

    return {
      missionsCreated,
      missionsResolved,
      contributionsGiven,
      offersCreated,
    };
  }
}
