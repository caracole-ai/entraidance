import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('matching')
@UseGuards(ThrottlerGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Throttle({ short: { limit: 30, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Get('suggestions')
  getSuggestions(@CurrentUser() user: { id: string }) {
    return this.matchingService.getSuggestionsForUser(user.id);
  }
}
