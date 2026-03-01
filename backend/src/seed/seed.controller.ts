import { Controller, Post, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async status() {
    return this.seedService.status();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async seed() {
    return this.seedService.seed();
  }

  @Post('clear')
  @HttpCode(HttpStatus.OK)
  async clear() {
    return this.seedService.clear();
  }
}
