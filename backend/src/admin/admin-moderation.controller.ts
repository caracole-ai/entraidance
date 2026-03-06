import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AdminModerationService } from './admin-moderation.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminModerationController {
  constructor(
    private readonly moderationService: AdminModerationService,
  ) {}

  @Get('users')
  getUsers() {
    return this.moderationService.getUsers();
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    await this.moderationService.deleteUser(id);
    return { deleted: true };
  }

  @Get('needs')
  getMissions() {
    return this.moderationService.getMissions();
  }

  @Delete('needs/:id')
  async deleteMission(@Param('id') id: string) {
    await this.moderationService.deleteMission(id);
    return { deleted: true };
  }

  @Get('offers')
  getOffers() {
    return this.moderationService.getOffers();
  }

  @Delete('offers/:id')
  async deleteOffer(@Param('id') id: string) {
    await this.moderationService.deleteOffer(id);
    return { deleted: true };
  }

  @Get('contributions')
  getContributions() {
    return this.moderationService.getContributions();
  }

  @Delete('contributions/:id')
  async deleteContribution(@Param('id') id: string) {
    await this.moderationService.deleteContribution(id);
    return { deleted: true };
  }

  @Get('stats')
  getStats() {
    return this.moderationService.getStats();
  }
}
