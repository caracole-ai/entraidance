import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from '../missions/entities/mission.entity';
import { Offer } from '../offers/entities/offer.entity';
import { Correlation } from '../correlations/entities/correlation.entity';
import {
  MissionStatus,
  OfferStatus,
  HelpType,
  OfferType,
  Urgency,
} from '../shared/enums';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Mission)
    private readonly missionsRepository: Repository<Mission>,
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    @InjectRepository(Correlation)
    private readonly correlationsRepository: Repository<Correlation>,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
  ) {}

  private helpTypeToOfferType(helpType: HelpType): OfferType[] {
    const mapping: Record<HelpType, OfferType[]> = {
      [HelpType.FINANCIERE]: [OfferType.DON],
      [HelpType.CONSEIL]: [OfferType.COMPETENCE],
      [HelpType.MATERIEL]: [OfferType.MATERIEL],
      [HelpType.RELATION]: [OfferType.SERVICE, OfferType.ECOUTE],
      [HelpType.AUTRE]: [],
    };
    return mapping[helpType] || [];
  }

  /**
   * Matching Algorithm V2.1 - Weighted scoring with urgency, timing, and skills
   *
   * Scoring breakdown (110 points max):
   * - Tag overlap: 25 points
   * - Category match: 20 points
   * - Help type mapping: 20 points
   * - Geographic proximity: 20 points
   * - Urgency bonus: 10 points
   * - Timing match: 5 points
   * - Skills bonus: 10 points (NEW - requires offer creator profile completion)
   */
  private computeScore(mission: Mission, offer: Offer): number {
    let score = 0;

    // 1. Tag overlap (weight: 25, down from 30 to make room for urgency/timing)
    const missionTags = mission.tags || [];
    const offerTags = offer.tags || [];
    const overlap = missionTags.filter((t) => offerTags.includes(t));
    if (missionTags.length > 0 && overlap.length > 0) {
      score += 25 * (overlap.length / missionTags.length);
    }

    // 2. Category match (weight: 20, down from 25)
    if (mission.category === offer.category) {
      score += 20;
    }

    // 3. Help type mapping (weight: 20, down from 25)
    const matchingTypes = this.helpTypeToOfferType(mission.helpType);
    if (matchingTypes.includes(offer.offerType)) {
      score += 20;
    }

    // 4. Geographic proximity (weight: 20, unchanged)
    if (
      mission.locationLat != null &&
      mission.locationLng != null &&
      offer.locationLat != null &&
      offer.locationLng != null
    ) {
      const dist = this.haversineKm(
        mission.locationLat,
        mission.locationLng,
        offer.locationLat,
        offer.locationLng,
      );
      const maxRadius = Math.max(
        mission.locationRadiusKm || 10,
        offer.locationRadiusKm || 10,
      );
      if (dist <= maxRadius) {
        score += 20 * (1 - dist / maxRadius);
      }
    }

    // 5. Urgency bonus (NEW - weight: 10)
    // More urgent missions get higher priority
    if (mission.urgency === Urgency.URGENT) {
      score += 10;
    } else if (mission.urgency === Urgency.MOYEN) {
      score += 5;
    }
    // Urgency.FAIBLE = no bonus

    // 6. Timing match (NEW - weight: 5)
    // Missions expiring soon should match with offers that can help quickly
    if (mission.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(mission.expiresAt);
      const daysLeft =
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      if (daysLeft > 0 && daysLeft <= 7) {
        // Mission expires within a week - high urgency
        score += 5;
      } else if (daysLeft > 7 && daysLeft <= 30) {
        // Expires within a month - moderate urgency
        score += 3;
      }
      // Expired or far future = no timing bonus
    }

    // 7. Skills bonus (NEW - weight: 10)
    // Boost score if offer creator has skills matching mission tags
    if (offer.creator?.skills && offer.creator.skills.length > 0) {
      const missionTags = mission.tags || [];
      const userSkills = offer.creator.skills;

      // Check if any user skill matches any mission tag (case-insensitive)
      const skillMatches = missionTags.filter((tag) =>
        userSkills.some(
          (skill) => skill.toLowerCase() === tag.toLowerCase(),
        ),
      );

      if (skillMatches.length > 0 && missionTags.length > 0) {
        // Partial credit based on match ratio
        score += 10 * (skillMatches.length / missionTags.length);
      }
    }

    return Math.round(score * 100) / 100;
  }

  private haversineKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async correlateMission(missionId: string): Promise<Correlation[]> {
    const mission = await this.missionsRepository.findOneBy({ id: missionId });
    if (!mission) return [];

    const offers = await this.offersRepository.find({
      where: { status: OfferStatus.OUVERTE },
      relations: ['creator'],
    });

    const results: Correlation[] = [];
    for (const offer of offers) {
      const score = this.computeScore(mission, offer);
      if (score < 10) continue;

      const existing = await this.correlationsRepository.findOneBy({
        missionId,
        offerId: offer.id,
      });

      if (existing) {
        await this.correlationsRepository.update(existing.id, { score });
        results.push({ ...existing, score });
      } else {
        const correlation = await this.correlationsRepository.save(
          this.correlationsRepository.create({
            missionId,
            offerId: offer.id,
            score,
          }),
        );
        results.push(correlation);

        // Notify offer creator about new match
        this.eventsGateway.sendToUser(offer.creatorId, 'match:new', {
          type: 'match',
          missionId: mission.id,
          offerId: offer.id,
          score,
          mission: {
            id: mission.id,
            title: mission.title,
            category: mission.category,
            urgency: mission.urgency,
          },
        });
      }
    }

    return results;
  }

  /**
   * Get personalized matching suggestions for a user
   *
   * Algorithm:
   * 1. Find all user's open offers
   * 2. Score each open mission against each offer
   * 3. Filter low scores (< 10)
   * 4. Sort by score (descending)
   * 5. Return top 20 matches
   *
   * @param userId - User ID to get suggestions for
   * @returns Array of mission/offer pairs with scores, sorted by relevance
   */
  async getSuggestionsForUser(userId: string) {
    // Find user's open offers
    const userOffers = await this.offersRepository.find({
      where: { creatorId: userId, status: OfferStatus.OUVERTE },
    });

    // If user has no offers, return empty suggestions
    if (userOffers.length === 0) {
      return [];
    }

    // Find all open missions (excluding user's own)
    const openMissions = await this.missionsRepository.find({
      where: { status: MissionStatus.OUVERTE },
      relations: ['creator'],
    });

    const suggestions: Array<{
      mission: Mission;
      offer: Offer;
      score: number;
    }> = [];

    // Score each mission against each offer
    for (const offer of userOffers) {
      for (const mission of openMissions) {
        // Don't suggest user's own missions
        if (mission.creatorId === userId) continue;

        const score = this.computeScore(mission, offer);

        // Only keep meaningful matches (score >= 10)
        if (score >= 10) {
          suggestions.push({ mission, offer, score });
        }
      }
    }

    // Sort by score (best matches first)
    suggestions.sort((a, b) => b.score - a.score);

    // Return top 20 suggestions
    return suggestions.slice(0, 20);
  }
}
