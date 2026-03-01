import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
import { Offer } from '../offers/entities/offer.entity';
import { Contribution } from '../contributions/entities/contribution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Mission, Offer, Contribution])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
