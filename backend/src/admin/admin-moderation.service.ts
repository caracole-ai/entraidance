import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import { Offer } from '../offers/entities/offer.entity';

@Injectable()
export class AdminModerationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Mission)
    private readonly missionRepo: Repository<Mission>,
    @InjectRepository(Contribution)
    private readonly contributionRepo: Repository<Contribution>,
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
  ) {}

  getUsers() {
    return this.userRepo.find({
      select: ['id', 'email', 'displayName', 'createdAt'],
    });
  }

  deleteUser(id: string) {
    return this.userRepo.delete(id);
  }

  getMissions() {
    return this.missionRepo.find({
      select: ['id', 'title', 'category', 'status', 'creatorId', 'createdAt'],
    });
  }

  deleteMission(id: string) {
    return this.missionRepo.delete(id);
  }

  getOffers() {
    return this.offerRepo.find({
      select: [
        'id',
        'title',
        'category',
        'offerType',
        'status',
        'creatorId',
        'createdAt',
      ],
    });
  }

  deleteOffer(id: string) {
    return this.offerRepo.delete(id);
  }

  getContributions() {
    return this.contributionRepo.find({
      select: ['id', 'userId', 'missionId', 'type', 'status', 'createdAt'],
    });
  }

  deleteContribution(id: string) {
    return this.contributionRepo.delete(id);
  }

  async getStats() {
    const [users, missions, offers, contributions] = await Promise.all([
      this.userRepo.count(),
      this.missionRepo.count(),
      this.offerRepo.count(),
      this.contributionRepo.count(),
    ]);
    return { users, missions, offers, contributions };
  }
}
