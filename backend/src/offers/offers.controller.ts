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
import { OffersService } from './offers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OfferFiltersDto } from './dto/offer-filters.dto';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  findAll(@Query() filters: OfferFiltersDto) {
    return this.offersService.findAll(filters);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateOfferDto) {
    return this.offersService.create(user.id, dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const offer = await this.offersService.findOne(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateOfferDto,
  ) {
    return this.offersService.update(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/close')
  close(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.offersService.close(id, user.id);
  }

  @Get(':id/correlations')
  getCorrelations(@Param('id') id: string) {
    return this.offersService.getCorrelations(id);
  }
}
