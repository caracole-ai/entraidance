import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import {
  MissionCategory,
  OfferType,
  OfferStatus,
  Visibility,
} from '../../shared/enums.js';
import { User } from '../../users/entities/user.entity.js';
import { Correlation } from '../../correlations/entities/correlation.entity.js';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  creatorId: string;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  category: MissionCategory;

  @Column({ type: 'varchar' })
  offerType: OfferType;

  @Column({ type: 'varchar', default: Visibility.PUBLIC })
  visibility: Visibility;

  @Column({ type: 'float', nullable: true })
  locationLat: number | null;

  @Column({ type: 'float', nullable: true })
  locationLng: number | null;

  @Column({ type: 'int', default: 10 })
  locationRadiusKm: number;

  @Column({ type: 'varchar', default: OfferStatus.OUVERTE })
  status: OfferStatus;

  @Column('simple-array')
  tags: string[];

  @Column({ type: 'text', nullable: true })
  availability: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  closedAt: Date;

  @ManyToOne(() => User, (user) => user.offers)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @OneToMany(() => Correlation, (correlation) => correlation.offer)
  correlations: Correlation[];
}
