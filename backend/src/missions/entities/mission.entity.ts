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
  MissionStatus,
  MissionCategory,
  HelpType,
  Urgency,
  Visibility,
} from '../../shared/enums';
import { User } from '../../users/entities/user.entity';
import { Contribution } from '../../contributions/entities/contribution.entity';
import { Correlation } from '../../correlations/entities/correlation.entity';

@Entity('missions')
export class Mission {
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
  helpType: HelpType;

  @Column({ type: 'varchar' })
  urgency: Urgency;

  @Column({ type: 'varchar', default: Visibility.PUBLIC })
  visibility: Visibility;

  @Column({ type: 'float', nullable: true })
  locationLat: number | null;

  @Column({ type: 'float', nullable: true })
  locationLng: number | null;

  @Column({ type: 'int', default: 10 })
  locationRadiusKm: number;

  @Column({ type: 'varchar', default: MissionStatus.OUVERTE })
  status: MissionStatus;

  @Column({ type: 'int', default: 0 })
  progressPercent: number;

  @Column('simple-array')
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  closedAt: Date;

  @Column({ type: 'text', nullable: true })
  closureFeedback: string | null;

  @Column({ type: 'text', nullable: true })
  closureThanks: string | null;

  @ManyToOne(() => User, (user) => user.missions)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @OneToMany(() => Contribution, (contribution) => contribution.mission)
  contributions: Contribution[];

  @OneToMany(() => Correlation, (correlation) => correlation.mission)
  correlations: Correlation[];
}
