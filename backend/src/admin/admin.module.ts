import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import { Offer } from '../offers/entities/offer.entity';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminGuard } from './admin.guard';
import { AdminModerationService } from './admin-moderation.service';
import { AdminModerationController } from './admin-moderation.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ADMIN_JWT_SECRET || 'admin-secret-key',
      signOptions: { expiresIn: '8h' },
    }),
    TypeOrmModule.forFeature([User, Mission, Contribution, Offer]),
  ],
  controllers: [AdminAuthController, AdminModerationController],
  providers: [AdminAuthService, AdminGuard, AdminModerationService],
})
export class AdminModule {}
