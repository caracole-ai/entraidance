import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';
import {
  MissionCategory,
  HelpType,
  Urgency,
  Visibility,
} from '../../shared/enums';

export class CreateMissionDto {
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsEnum(MissionCategory)
  category: MissionCategory;

  @IsEnum(HelpType)
  helpType: HelpType;

  @IsEnum(Urgency)
  urgency: Urgency;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

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
