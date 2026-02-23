import { Injectable } from '@nestjs/common';
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
} from '../shared/enums';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Mission)
    private readonly missionsRepository: Repository<Mission>,
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    @InjectRepository(Correlation)
    private readonly correlationsRepository: Repository<Correlation>,
  ) {}

  private helpTypeToOfferType(helpType: HelpType): OfferType[] {
    const mapping: Record<HelpType, OfferType[]> = {
      [HelpType.FINANCIERE]: [OfferType.DON],
      [HelpType.CONSEIL]: [OfferType.COMPETENCE],
      [HelpType.MATERIEL]: [OfferType.MATERIEL],
      [HelpType.RELATION]: [OfferType.SERVICE, OfferType.ECOUTE],
    };
    return mapping[helpType] || [];
  }

  private computeScore(mission: Mission, offer: Offer): number {
    let score = 0;

    // Tag overlap (weight: 30)
    const missionTags = mission.tags || [];
    const offerTags = offer.tags || [];
    const overlap = missionTags.filter((t) => offerTags.includes(t));
    if (missionTags.length > 0 && overlap.length > 0) {
      score += 30 * (overlap.length / missionTags.length);
    }

    // Category match (weight: 25)
    if (mission.category === offer.category) {
      score += 25;
    }

    // Help type mapping (weight: 25)
    const matchingTypes = this.helpTypeToOfferType(mission.helpType);
    if (matchingTypes.includes(offer.offerType)) {
      score += 25;
    }

    // Geographic proximity (weight: 20)
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
      }
    }

    return results;
  }

  async getSuggestionsForUser(userId: string) {
    // Find user's open offers and see which missions match
    const userOffers = await this.offersRepository.find({
      where: { creatorId: userId, status: OfferStatus.OUVERTE },
    });

    const openMissions = await this.missionsRepository.find({
      where: { status: MissionStatus.OUVERTE },
      relations: ['creator'],
    });

    const suggestions: Array<{
      mission: Mission;
      offer: Offer;
      score: number;
    }> = [];

    for (const offer of userOffers) {
      for (const mission of openMissions) {
        if (mission.creatorId === userId) continue;
        const score = this.computeScore(mission, offer);
        if (score >= 10) {
          suggestions.push({ mission, offer, score });
        }
      }
    }

    // Also find missions that match user's profile - get missions not created by user
    const matchingMissions = openMissions
      .filter((m) => m.creatorId !== userId)
      .slice(0, 10);

    // Deduplicate: keep suggestions + any missions not already in suggestions
    const suggestedMissionIds = new Set(suggestions.map((s) => s.mission.id));
    const additionalMissions = matchingMissions
      .filter((m) => !suggestedMissionIds.has(m.id))
      .map((m) => ({ mission: m, offer: null as Offer | null, score: 0 }));

    const all = [...suggestions, ...additionalMissions];
    all.sort((a, b) => b.score - a.score);

    return all.slice(0, 20);
  }
}
