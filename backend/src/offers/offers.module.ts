import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Correlation } from '../correlations/entities/correlation.entity';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, Correlation])],
  providers: [OffersService],
  controllers: [OffersController],
  exports: [OffersService],
})
export class OffersModule {}
