import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Mission } from '../../missions/entities/mission.entity';
import { Offer } from '../../offers/entities/offer.entity';

@Entity('correlations')
@Unique(['missionId', 'offerId'])
export class Correlation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  missionId: string;

  @Column()
  offerId: string;

  @Column({ type: 'float' })
  score: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Mission, (mission) => mission.correlations)
  @JoinColumn({ name: 'missionId' })
  mission: Mission;

  @ManyToOne(() => Offer, (offer) => offer.correlations)
  @JoinColumn({ name: 'offerId' })
  offer: Offer;
}
