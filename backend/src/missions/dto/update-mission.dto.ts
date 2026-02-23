import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import {
  MissionCategory,
  HelpType,
  Urgency,
  MissionStatus,
  Visibility,
} from '../../shared/enums';

export class UpdateMissionDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

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
  @IsEnum(Visibility)
  visibility?: Visibility;

  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @IsOptional()
  @IsNumber()
  locationRadiusKm?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
