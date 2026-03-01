import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
import { Offer } from '../offers/entities/offer.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import {
  MissionStatus,
  MissionCategory,
  HelpType,
  Urgency,
  Visibility,
  OfferType,
  OfferStatus,
  ContributionType,
  ContributionStatus,
} from '../shared/enums';

@Injectable()
export class SeedService {
  constructor(private dataSource: DataSource) {}

  async status() {
    const tables = await this.dataSource.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).catch((err) => ({ error: err.message }));

    return {
      nodeEnv: process.env.NODE_ENV,
      dbType: this.dataSource.options.type,
      dbPath: (this.dataSource.options as any).database,
      synchronize: (this.dataSource.options as any).synchronize,
      migrationsRun: (this.dataSource.options as any).migrationsRun,
      tables: Array.isArray(tables) ? tables.map((t) => t.name) : tables,
    };
  }

  private async ensureTables() {
    // Check if tables exist
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.query('SELECT 1 FROM user LIMIT 1');
    } catch (error) {
      // Tables don't exist, force synchronize
      console.log('🔧 Tables not found, creating schema...');
      await this.dataSource.synchronize();
      console.log('✅ Schema created successfully');
    } finally {
      await queryRunner.release();
    }
  }

  async seed() {
    // Ensure tables exist before seeding
    await this.ensureTables();
    
    // Clear existing demo data
    await this.clear();

    const userRepo = this.dataSource.getRepository(User);
    const missionRepo = this.dataSource.getRepository(Mission);
    const offerRepo = this.dataSource.getRepository(Offer);
    const contributionRepo = this.dataSource.getRepository(Contribution);

    // Create 5 demo users
    const users = await userRepo.save([
      {
        email: 'sophie.martin@demo.fr',
        name: 'Sophie Martin',
        picture: 'https://i.pravatar.cc/150?img=1',
        isDemo: true,
      },
      {
        email: 'thomas.bernard@demo.fr',
        name: 'Thomas Bernard',
        picture: 'https://i.pravatar.cc/150?img=2',
        isDemo: true,
      },
      {
        email: 'lea.dubois@demo.fr',
        name: 'Léa Dubois',
        picture: 'https://i.pravatar.cc/150?img=3',
        isDemo: true,
      },
      {
        email: 'lucas.petit@demo.fr',
        name: 'Lucas Petit',
        picture: 'https://i.pravatar.cc/150?img=4',
        isDemo: true,
      },
      {
        email: 'emma.roux@demo.fr',
        name: 'Emma Roux',
        picture: 'https://i.pravatar.cc/150?img=5',
        isDemo: true,
      },
    ]);

    // Create 6 demo missions
    const missions = await missionRepo.save([
      {
        title: 'Besoin d\'aide pour déménagement',
        description: 'Je cherche quelqu\'un pour m\'aider à déménager ce weekend',
        category: MissionCategory.DEMENAGEMENT,
        helpType: HelpType.MATERIEL,
        urgency: Urgency.MOYEN,
        visibility: Visibility.PUBLIC,
        status: MissionStatus.OUVERTE,
        creatorId: users[0].id,
        isDemo: true,
      },
      {
        title: 'Aide administrative pour démarches',
        description: 'J\'ai besoin d\'aide pour remplir des formulaires administratifs',
        category: MissionCategory.ADMINISTRATIF,
        helpType: HelpType.CONSEIL,
        urgency: Urgency.URGENT,
        visibility: Visibility.PUBLIC,
        status: MissionStatus.OUVERTE,
        creatorId: users[1].id,
        isDemo: true,
      },
      {
        title: 'Réparation vélo',
        description: 'Mon vélo a besoin de réparations, quelqu\'un peut m\'aider ?',
        category: MissionCategory.BRICOLAGE,
        helpType: HelpType.MATERIEL,
        urgency: Urgency.FAIBLE,
        visibility: Visibility.PUBLIC,
        status: MissionStatus.OUVERTE,
        creatorId: users[2].id,
        isDemo: true,
      },
      {
        title: 'Garde d\'enfants ponctuelle',
        description: 'Recherche garde d\'enfants pour samedi après-midi',
        category: MissionCategory.GARDE_ENFANTS,
        helpType: HelpType.MATERIEL,
        urgency: Urgency.MOYEN,
        visibility: Visibility.PUBLIC,
        status: MissionStatus.EN_COURS,
        creatorId: users[3].id,
        isDemo: true,
      },
      {
        title: 'Aide pour CV et recherche d\'emploi',
        description: 'Je cherche quelqu\'un pour m\'aider à améliorer mon CV',
        category: MissionCategory.EMPLOI,
        helpType: HelpType.CONSEIL,
        urgency: Urgency.MOYEN,
        visibility: Visibility.PUBLIC,
        status: MissionStatus.OUVERTE,
        creatorId: users[4].id,
        isDemo: true,
      },
      {
        title: 'Don de nourriture à récupérer',
        description: 'J\'ai des denrées à donner, qui peut venir les chercher ?',
        category: MissionCategory.ALIMENTATION,
        helpType: HelpType.MATERIEL,
        urgency: Urgency.FAIBLE,
        visibility: Visibility.PUBLIC,
        status: MissionStatus.OUVERTE,
        creatorId: users[0].id,
        isDemo: true,
      },
    ]);

    // Create 4 demo offers
    const offers = await offerRepo.save([
      {
        title: 'Propose aide déménagement',
        description: 'Je peux aider pour des déménagements le weekend',
        type: OfferType.SERVICE,
        status: OfferStatus.OUVERTE,
        creatorId: users[1].id,
        isDemo: true,
      },
      {
        title: 'Don de vêtements',
        description: 'J\'ai des vêtements en bon état à donner',
        type: OfferType.MATERIEL,
        status: OfferStatus.OUVERTE,
        creatorId: users[2].id,
        isDemo: true,
      },
      {
        title: 'Cours de français',
        description: 'Je propose des cours de français gratuits',
        type: OfferType.COMPETENCE,
        status: OfferStatus.OUVERTE,
        creatorId: users[3].id,
        isDemo: true,
      },
      {
        title: 'Écoute et soutien',
        description: 'Disponible pour écouter et soutenir moralement',
        type: OfferType.ECOUTE,
        status: OfferStatus.OUVERTE,
        creatorId: users[4].id,
        isDemo: true,
      },
    ]);

    // Create 4 demo contributions
    const contributions = await contributionRepo.save([
      {
        missionId: missions[0].id,
        userId: users[1].id,
        type: ContributionType.PROPOSE,
        message: 'Je peux t\'aider pour le déménagement !',
        status: ContributionStatus.ACTIVE,
        isDemo: true,
      },
      {
        missionId: missions[1].id,
        userId: users[2].id,
        type: ContributionType.CONSEILLE,
        message: 'J\'ai de l\'expérience en administratif, je peux t\'aider',
        status: ContributionStatus.ACTIVE,
        isDemo: true,
      },
      {
        missionId: missions[3].id,
        userId: users[4].id,
        type: ContributionType.PARTICIPE,
        message: 'Je garde les enfants samedi',
        status: ContributionStatus.ACTIVE,
        isDemo: true,
      },
      {
        missionId: missions[4].id,
        userId: users[3].id,
        type: ContributionType.CONSEILLE,
        message: 'Je peux t\'aider avec ton CV',
        status: ContributionStatus.ACTIVE,
        isDemo: true,
      },
    ]);

    return {
      success: true,
      message: 'Demo data seeded successfully',
      stats: {
        users: users.length,
        missions: missions.length,
        offers: offers.length,
        contributions: contributions.length,
      },
    };
  }

  async clear() {
    await this.dataSource.query('DELETE FROM contribution WHERE isDemo = true');
    await this.dataSource.query('DELETE FROM offer WHERE isDemo = true');
    await this.dataSource.query('DELETE FROM mission WHERE isDemo = true');
    await this.dataSource.query('DELETE FROM user WHERE isDemo = true');

    return {
      success: true,
      message: 'Demo data cleared successfully',
    };
  }
}
