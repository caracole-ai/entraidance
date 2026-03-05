import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContributionType, ContributionStatus } from '../../shared/enums';
import { User } from '../../users/entities/user.entity';
import { Mission } from '../../missions/entities/mission.entity';

@Entity('contributions')
export class Contribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  missionId: string;

  @Column({ type: 'varchar' })
  type: ContributionType;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({
    type: 'varchar',
    default: ContributionStatus.ACTIVE,
  })
  status: ContributionStatus;

  @Column({ type: 'boolean', default: false })
  isDemo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.contributions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Mission, (mission) => mission.contributions)
  @JoinColumn({ name: 'missionId' })
  mission: Mission;
}
