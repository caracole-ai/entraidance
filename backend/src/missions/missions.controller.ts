import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { MissionsService } from './missions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { CloseMissionDto } from './dto/close-mission.dto';
import { MissionFiltersDto } from './dto/mission-filters.dto';

@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  findAll(@Query() filters: MissionFiltersDto) {
    return this.missionsService.findAll(filters);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateMissionDto) {
    return this.missionsService.create(user.id, dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const mission = await this.missionsService.findOne(id);
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }
    return mission;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateMissionDto,
  ) {
    return this.missionsService.update(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/close')
  close(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CloseMissionDto,
  ) {
    return this.missionsService.close(id, user.id, dto);
  }

  @Get(':id/contributions')
  getContributions(@Param('id') id: string) {
    return this.missionsService.getContributions(id);
  }

  @Get(':id/correlations')
  getCorrelations(@Param('id') id: string) {
    return this.missionsService.getCorrelations(id);
  }
}
