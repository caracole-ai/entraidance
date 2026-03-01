import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
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

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting database seeding...\n');

  // Clear existing demo data
  await dataSource.query('DELETE FROM contribution WHERE isDemo = true');
  await dataSource.query('DELETE FROM offer WHERE isDemo = true');
  await dataSource.query('DELETE FROM mission WHERE isDemo = true');
  await dataSource.query('DELETE FROM user WHERE isDemo = true');

  const userRepo = dataSource.getRepository(User);
  const missionRepo = dataSource.getRepository(Mission);
  const offerRepo = dataSource.getRepository(Offer);
  const contributionRepo = dataSource.getRepository(Contribution);

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

  console.log(`✅ Created ${users.length} demo users`);

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

  console.log(`✅ Created ${missions.length} demo missions`);

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

  console.log(`✅ Created ${offers.length} demo offers`);

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

  console.log(`✅ Created ${contributions.length} demo contributions`);

  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('Demo data summary:');
  console.log(`  - ${users.length} users`);
  console.log(`  - ${missions.length} missions`);
  console.log(`  - ${offers.length} offers`);
  console.log(`  - ${contributions.length} contributions\n`);

  await app.close();
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
