import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Mission } from '../../missions/entities/mission.entity';
import { Contribution } from '../../contributions/entities/contribution.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Notification } from '../../notifications/entities/notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  oauthProvider: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  oauthProviderId: string | null;

  @Column({ type: 'varchar', length: 100 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'float', nullable: true })
  locationLat: number | null;

  @Column({ type: 'float', nullable: true })
  locationLng: number | null;

  @Column({ type: 'boolean', default: false })
  isPremium: boolean;

  @Column({ type: 'boolean', default: false })
  isDemo: boolean;

  // Profile completion fields
  @Column({ type: 'simple-array', nullable: true })
  skills: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  interests: string[] | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'int', nullable: true })
  availabilityHours: number | null;

  // Matching preferences
  @Column({ type: 'int', nullable: true, default: 50 })
  maxDistanceKm: number | null;

  @Column({ type: 'simple-array', nullable: true })
  preferredCategories: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  preferredUrgencies: string[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Mission, (mission) => mission.creator)
  missions: Mission[];

  @OneToMany(() => Contribution, (contribution) => contribution.user)
  contributions: Contribution[];

  @OneToMany(() => Offer, (offer) => offer.creator)
  offers: Offer[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
