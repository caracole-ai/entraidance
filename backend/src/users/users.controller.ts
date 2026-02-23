import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger('UsersController');

  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() currentUser: { id: string }) {
    const user = await this.usersService.findOne(currentUser.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, oauthProviderId, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteMe(@CurrentUser() currentUser: { id: string }) {
    this.logger.log(`Account deletion requested by user: ${currentUser.id}`);
    await this.usersService.deleteAccount(currentUser.id);
    return { message: 'Account deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/export')
  async exportData(@CurrentUser() currentUser: { id: string }) {
    return this.usersService.exportUserData(currentUser.id);
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
