import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';

@Controller()
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('missions/:missionId/contributions')
  create(
    @Param('missionId') missionId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateContributionDto,
  ) {
    return this.contributionsService.create(user.id, missionId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('contributions/:id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateContributionDto,
  ) {
    return this.contributionsService.update(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('contributions/:id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.contributionsService.remove(id, user.id);
  }
}
