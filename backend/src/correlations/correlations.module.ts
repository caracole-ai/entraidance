import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Correlation } from './entities/correlation.entity';
import { CorrelationsService } from './correlations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Correlation])],
  providers: [CorrelationsService],
  exports: [CorrelationsService],
})
export class CorrelationsModule {}
