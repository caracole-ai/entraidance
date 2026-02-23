import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  MaxLength,
} from 'class-validator';
import { MissionCategory, OfferType, Visibility } from '../../shared/enums';

export class CreateOfferDto {
  @IsString()
  @MaxLength(120)
  title: string;

  @IsString()
  description: string;

  @IsEnum(MissionCategory)
  category: MissionCategory;

  @IsEnum(OfferType)
  offerType: OfferType;

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

  @IsOptional()
  @IsString()
  availability?: string;
}
