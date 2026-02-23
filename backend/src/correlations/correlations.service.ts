import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Correlation } from './entities/correlation.entity';

@Injectable()
export class CorrelationsService {
  constructor(
    @InjectRepository(Correlation)
    private readonly correlationsRepository: Repository<Correlation>,
  ) {}

  findByMission(missionId: string): Promise<Correlation[]> {
    return this.correlationsRepository.find({
      where: { missionId },
      relations: ['offer'],
    });
  }

  findByOffer(offerId: string): Promise<Correlation[]> {
    return this.correlationsRepository.find({
      where: { offerId },
      relations: ['mission'],
    });
  }

  create(data: Partial<Correlation>): Promise<Correlation> {
    const correlation = this.correlationsRepository.create(data);
    return this.correlationsRepository.save(correlation);
  }
}
