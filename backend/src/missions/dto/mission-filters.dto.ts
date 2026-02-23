import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MissionCategory,
  HelpType,
  Urgency,
  MissionStatus,
} from '../../shared/enums';

export class MissionFiltersDto {
  @IsOptional()
  @IsEnum(MissionCategory)
  category?: MissionCategory;

  @IsOptional()
  @IsEnum(HelpType)
  helpType?: HelpType;

  @IsOptional()
  @IsEnum(Urgency)
  urgency?: Urgency;

  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(10000)
  radiusKm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
