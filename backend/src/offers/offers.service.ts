import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Correlation } from '../correlations/entities/correlation.entity';
import { OfferStatus } from '../shared/enums';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OfferFiltersDto } from './dto/offer-filters.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    @InjectRepository(Correlation)
    private readonly correlationsRepository: Repository<Correlation>,
  ) {}

  async findAll(filters: OfferFiltersDto) {
    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(Math.max(filters.limit || 20, 1), 100);
    const skip = (page - 1) * limit;

    const qb = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.creator', 'creator')
      .select([
        'offer',
        'creator.id',
        'creator.displayName',
        'creator.avatarUrl',
      ]);

    if (filters.category) {
      qb.andWhere('offer.category = :category', {
        category: filters.category,
      });
    }

    if (filters.offerType) {
      qb.andWhere('offer.offerType = :offerType', {
        offerType: filters.offerType,
      });
    }

    if (filters.tags) {
      const tagsArray = filters.tags.split(',').map((t) => t.trim());
      for (let i = 0; i < tagsArray.length; i++) {
        qb.andWhere(`offer.tags LIKE :tag${i}`, {
          [`tag${i}`]: `%${tagsArray[i]}%`,
        });
      }
    }

    if (filters.search) {
      qb.andWhere(
        '(LOWER(offer.title) LIKE LOWER(:search) OR LOWER(offer.description) LIKE LOWER(:search))',
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
          ST_SetSRID(ST_MakePoint(offer.locationLng, offer.locationLat), 4326)::geography,
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

    qb.orderBy('offer.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findOne(id: string): Promise<Offer | null> {
    return this.offersRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
  }

  async create(userId: string, dto: CreateOfferDto): Promise<Offer> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const offer = this.offersRepository.create({
      ...dto,
      creatorId: userId,
      tags: dto.tags || [],
      expiresAt,
    });
    return this.offersRepository.save(offer);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateOfferDto,
  ): Promise<Offer> {
    const offer = await this.offersRepository.findOneBy({ id });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    if (offer.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can update this offer');
    }

    await this.offersRepository.update(id, dto);
    return this.offersRepository.findOneOrFail({
      where: { id },
      relations: ['creator'],
    });
  }

  async close(id: string, userId: string): Promise<Offer> {
    const offer = await this.offersRepository.findOneBy({ id });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    if (offer.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can close this offer');
    }

    await this.offersRepository.update(id, {
      status: OfferStatus.CLOTUREE,
      closedAt: new Date(),
    });

    return this.offersRepository.findOneOrFail({
      where: { id },
      relations: ['creator'],
    });
  }

  getCorrelations(offerId: string): Promise<Correlation[]> {
    return this.correlationsRepository.find({
      where: { offerId },
      relations: ['mission', 'mission.creator'],
      order: { score: 'DESC' },
    });
  }
}
