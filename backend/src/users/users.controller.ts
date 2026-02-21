import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() currentUser: { id: string }) {
    const user = await this.usersService.findOne(currentUser.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, oauthProviderId, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @CurrentUser() currentUser: { id: string },
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(currentUser.id, dto);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, oauthProviderId, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/missions')
  getMissions(@CurrentUser() currentUser: { id: string }) {
    return this.usersService.getUserMissions(currentUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/contributions')
  getContributions(@CurrentUser() currentUser: { id: string }) {
    return this.usersService.getUserContributions(currentUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  getStats(@CurrentUser() currentUser: { id: string }) {
    return this.usersService.getUserStats(currentUser.id);
  }
}
