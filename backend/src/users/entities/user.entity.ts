import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Mission } from '../../missions/entities/mission.entity.js';
import { Contribution } from '../../contributions/entities/contribution.entity.js';
import { Offer } from '../../offers/entities/offer.entity.js';
import { Notification } from '../../notifications/entities/notification.entity.js';

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
