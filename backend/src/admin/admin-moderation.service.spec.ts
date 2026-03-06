import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminModerationService } from './admin-moderation.service';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import { Offer } from '../offers/entities/offer.entity';

function mockRepo() {
  return {
    find: jest.fn().mockResolvedValue([]),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    count: jest.fn().mockResolvedValue(0),
    createQueryBuilder: jest.fn(),
  };
}

describe('AdminModerationService', () => {
  let service: AdminModerationService;
  let userRepo: ReturnType<typeof mockRepo>;
  let missionRepo: ReturnType<typeof mockRepo>;
  let contributionRepo: ReturnType<typeof mockRepo>;
  let offerRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    userRepo = mockRepo();
    missionRepo = mockRepo();
    contributionRepo = mockRepo();
    offerRepo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminModerationService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Mission), useValue: missionRepo },
        { provide: getRepositoryToken(Contribution), useValue: contributionRepo },
        { provide: getRepositoryToken(Offer), useValue: offerRepo },
      ],
    }).compile();

    service = module.get<AdminModerationService>(AdminModerationService);
  });

  describe('getStats', () => {
    it('should return counts from all repositories', async () => {
      userRepo.count.mockResolvedValue(10);
      missionRepo.count.mockResolvedValue(5);
      offerRepo.count.mockResolvedValue(3);
      contributionRepo.count.mockResolvedValue(7);

      const result = await service.getStats();

      expect(result).toEqual({
        users: 10,
        missions: 5,
        offers: 3,
        contributions: 7,
      });
    });
  });

  describe('deleteUser', () => {
    it('should call userRepo.delete with the id', async () => {
      await service.deleteUser('user-1');
      expect(userRepo.delete).toHaveBeenCalledWith('user-1');
    });
  });

  describe('deleteMission', () => {
    it('should call missionRepo.delete with the id', async () => {
      await service.deleteMission('mission-1');
      expect(missionRepo.delete).toHaveBeenCalledWith('mission-1');
    });
  });

  describe('deleteOffer', () => {
    it('should call offerRepo.delete with the id', async () => {
      await service.deleteOffer('offer-1');
      expect(offerRepo.delete).toHaveBeenCalledWith('offer-1');
    });
  });

  describe('deleteContribution', () => {
    it('should call contributionRepo.delete with the id', async () => {
      await service.deleteContribution('contrib-1');
      expect(contributionRepo.delete).toHaveBeenCalledWith('contrib-1');
    });
  });

  describe('getUsers', () => {
    it('should call userRepo.find with select option', async () => {
      await service.getUsers();
      expect(userRepo.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'displayName', 'createdAt'],
      });
    });
  });

  describe('getMissions', () => {
    it('should call missionRepo.find with select option', async () => {
      await service.getMissions();
      expect(missionRepo.find).toHaveBeenCalledWith({
        select: ['id', 'title', 'category', 'status', 'creatorId', 'createdAt'],
      });
    });
  });
});
