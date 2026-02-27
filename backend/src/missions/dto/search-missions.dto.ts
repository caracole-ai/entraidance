import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsEnum,
  IsNumber,
  Max,
} from 'class-validator';
import {
  MissionCategory,
  Urgency,
  MissionStatus,
  Visibility,
} from '../../shared/enums';
import { Type } from 'class-transformer';

export class SearchMissionsDto {
  @IsOptional()
  @IsString()
  q?: string; // Full-text search query

  @IsOptional()
  @IsEnum(MissionCategory)
  category?: MissionCategory;

  @IsOptional()
  @IsEnum(Urgency)
  urgency?: Urgency;

  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lat?: number; // Latitude for location search

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lng?: number; // Longitude for location search

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(1000)
  radius?: number; // Radius in km

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'expiresAt' | 'urgency'; // Sort field

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC'; // Sort direction

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;
}
