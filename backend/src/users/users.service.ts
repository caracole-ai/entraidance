import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { Mission } from '../missions/entities/mission.entity.js';
import { Contribution } from '../contributions/entities/contribution.entity.js';
import { Offer } from '../offers/entities/offer.entity.js';
import { MissionStatus } from '../shared/enums.js';

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

  async findByOAuthProvider(provider: string, providerId: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ oauthProvider: provider, oauthProviderId: providerId });
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
