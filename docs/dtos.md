# DTOs (Data Transfer Objects)

> Voir aussi: [enums-types.md](./enums-types.md) pour les valeurs d'enums, [api-endpoints.md](./api-endpoints.md) pour les routes

Global ValidationPipe: `whitelist: true` (proprietes inconnues supprimees), `transform: true` (auto-cast query params)

## Auth

### RegisterDto
| Field | Type | Validators |
|-------|------|-----------|
| email | string | @IsEmail() |
| password | string | @IsString(), @MinLength(6) |
| displayName | string | @IsString(), @MinLength(2), @MaxLength(100) |

### LoginDto
| Field | Type | Validators |
|-------|------|-----------|
| email | string | @IsEmail() |
| password | string | @IsString() |

## Users

### UpdateUserDto
| Field | Type | Validators |
|-------|------|-----------|
| displayName? | string | @IsOptional(), @IsString(), @MinLength(2), @MaxLength(100) |
| avatarUrl? | string | @IsOptional(), @IsString() |

## Missions

### CreateMissionDto
| Field | Type | Validators |
|-------|------|-----------|
| title | string | @IsString(), @MinLength(5), @MaxLength(120) |
| description | string | @IsString(), @MinLength(10) |
| category | MissionCategory | @IsEnum(MissionCategory) |
| helpType | HelpType | @IsEnum(HelpType) |
| urgency | Urgency | @IsEnum(Urgency) |
| visibility? | Visibility | @IsOptional(), @IsEnum(Visibility) |
| locationLat? | number | @IsOptional(), @IsNumber() |
| locationLng? | number | @IsOptional(), @IsNumber() |
| locationRadiusKm? | number | @IsOptional(), @IsNumber() |
| tags? | string[] | @IsOptional(), @IsArray(), @IsString({ each: true }) |

### UpdateMissionDto
| Field | Type | Validators |
|-------|------|-----------|
| title? | string | @IsOptional(), @MinLength(5), @MaxLength(120) |
| description? | string | @IsOptional(), @MinLength(10) |
| category? | MissionCategory | @IsOptional(), @IsEnum() |
| helpType? | HelpType | @IsOptional(), @IsEnum() |
| urgency? | Urgency | @IsOptional(), @IsEnum() |
| visibility? | Visibility | @IsOptional(), @IsEnum() |
| status? | MissionStatus | @IsOptional(), @IsEnum() |
| progressPercent? | number | @IsOptional(), @IsNumber(), @Min(0), @Max(100) |
| locationLat? | number | @IsOptional(), @IsNumber() |
| locationLng? | number | @IsOptional(), @IsNumber() |
| locationRadiusKm? | number | @IsOptional(), @IsNumber() |
| tags? | string[] | @IsOptional(), @IsArray(), @IsString({ each: true }) |

### CloseMissionDto
| Field | Type | Validators |
|-------|------|-----------|
| closureFeedback? | string | @IsOptional(), @IsString() |
| closureThanks? | string | @IsOptional(), @IsString() |

### MissionFiltersDto (Query params)
| Field | Type | Validators |
|-------|------|-----------|
| category? | MissionCategory | @IsOptional(), @IsEnum() |
| helpType? | HelpType | @IsOptional(), @IsEnum() |
| urgency? | Urgency | @IsOptional(), @IsEnum() |
| status? | MissionStatus | @IsOptional(), @IsEnum() |
| tags? | string | @IsOptional(), @IsString() (comma-separated) |
| search? | string | @IsOptional(), @IsString() |
| lat? | number | @IsOptional(), @Type(() => Number) |
| lng? | number | @IsOptional(), @Type(() => Number) |
| radiusKm? | number | @IsOptional(), @Type(() => Number) |
| page? | number | @IsOptional(), @Type(() => Number) |
| limit? | number | @IsOptional(), @Type(() => Number) |

## Contributions

### CreateContributionDto
| Field | Type | Validators |
|-------|------|-----------|
| type | ContributionType | @IsEnum(ContributionType) |
| message? | string | @IsOptional(), @IsString() |

### UpdateContributionDto
| Field | Type | Validators |
|-------|------|-----------|
| message? | string | @IsOptional(), @IsString() |

## Offers

### CreateOfferDto
| Field | Type | Validators |
|-------|------|-----------|
| title | string | @IsString(), @MaxLength(120) |
| description | string | @IsString() |
| category | MissionCategory | @IsEnum(MissionCategory) |
| offerType | OfferType | @IsEnum(OfferType) |
| visibility? | Visibility | @IsOptional(), @IsEnum() |
| locationLat? | number | @IsOptional(), @IsNumber() |
| locationLng? | number | @IsOptional(), @IsNumber() |
| locationRadiusKm? | number | @IsOptional(), @IsNumber() |
| tags? | string[] | @IsOptional(), @IsArray(), @IsString({ each: true }) |
| availability? | string | @IsOptional(), @IsString() |

### UpdateOfferDto
Tous les champs de CreateOfferDto mais optionnels.

### OfferFiltersDto (Query params)
| Field | Type | Validators |
|-------|------|-----------|
| category? | MissionCategory | @IsOptional(), @IsEnum() |
| offerType? | OfferType | @IsOptional(), @IsEnum() |
| search? | string | @IsOptional(), @IsString() |
| tags? | string | @IsOptional(), @IsString() (comma-separated) |
| lat? | number | @IsOptional(), @Type(() => Number) |
| lng? | number | @IsOptional(), @Type(() => Number) |
| radiusKm? | number | @IsOptional(), @Type(() => Number) |
| page? | number | @IsOptional(), @Type(() => Number) |
| limit? | number | @IsOptional(), @Type(() => Number) |

## Notifications

### UpdateNotificationDto
| Field | Type | Validators |
|-------|------|-----------|
| isRead? | boolean | @IsOptional(), @IsBoolean() |
