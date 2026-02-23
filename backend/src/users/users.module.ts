import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import { Offer } from '../offers/entities/offer.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Mission,
      Contribution,
      Offer,
      Notification,
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
