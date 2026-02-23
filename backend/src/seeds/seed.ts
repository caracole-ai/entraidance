import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import { Offer } from '../offers/entities/offer.entity';
import {
  MissionCategory,
  HelpType,
  Urgency,
  Visibility,
  MissionStatus,
  OfferType,
  OfferStatus,
  ContributionType,
  ContributionStatus,
} from '../shared/enums';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'gr_user',
  password: process.env.DB_PASSWORD || 'gr_password',
  database: process.env.DB_DATABASE || 'gr_attitude',
  entities: [User, Mission, Contribution, Offer],
  synchronize: true,
});

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error(
      'Seeding is not allowed in production. Set NODE_ENV to something else.',
    );
    process.exit(1);
  }

  await dataSource.initialize();
  console.log('Database connected.');

  const userRepo = dataSource.getRepository(User);
  const missionRepo = dataSource.getRepository(Mission);
  const contributionRepo = dataSource.getRepository(Contribution);
  const offerRepo = dataSource.getRepository(Offer);

  // Check idempotency
  const existingUsers = await userRepo.count();
  if (existingUsers > 0) {
    console.log('Seed data already exists. Skipping.');
    await dataSource.destroy();
    return;
  }

  const seedPassword = process.env.SEED_PASSWORD || 'Password1!';
  const passwordHash = await bcrypt.hash(seedPassword, 10);

  // --- Users ---
  const users = await userRepo.save([
    {
      email: 'alice@example.com',
      passwordHash,
      displayName: 'Alice Martin',
      locationLat: 48.8566,
      locationLng: 2.3522,
      isPremium: false,
    },
    {
      email: 'bob@example.com',
      passwordHash,
      displayName: 'Bob Dupont',
      locationLat: 43.2965,
      locationLng: 5.3698,
      isPremium: true,
    },
    {
      email: 'claire@example.com',
      passwordHash,
      displayName: 'Claire Bernard',
      locationLat: 45.764,
      locationLng: 4.8357,
      isPremium: false,
    },
    {
      email: 'david@example.com',
      passwordHash,
      displayName: 'David Leroy',
      locationLat: 48.5734,
      locationLng: 7.7521,
      isPremium: false,
    },
    {
      email: 'emma@example.com',
      passwordHash,
      displayName: 'Emma Moreau',
      locationLat: 44.8378,
      locationLng: -0.5792,
      isPremium: false,
    },
  ]);

  console.log(`Created ${users.length} users.`);

  // --- Missions ---
  const missions = await missionRepo.save([
    {
      creatorId: users[0].id,
      title: 'Aide pour demenagement',
      description:
        "Je demenage le 15 mars et j'ai besoin de bras pour porter des cartons.",
      category: MissionCategory.DEMENAGEMENT,
      helpType: HelpType.MATERIEL,
      urgency: Urgency.URGENT,
      visibility: Visibility.PUBLIC,
      locationLat: 48.8566,
      locationLng: 2.3522,
      locationRadiusKm: 15,
      status: MissionStatus.OUVERTE,
      tags: ['demenagement', 'paris', 'cartons'],
      expiresAt: daysFromNow(30),
    },
    {
      creatorId: users[0].id,
      title: 'Conseil juridique bail',
      description:
        'Mon proprietaire refuse de rendre la caution. Besoin de conseils.',
      category: MissionCategory.ADMINISTRATIF,
      helpType: HelpType.CONSEIL,
      urgency: Urgency.MOYEN,
      visibility: Visibility.PUBLIC,
      locationLat: 48.8566,
      locationLng: 2.3522,
      tags: ['juridique', 'bail', 'caution'],
      expiresAt: daysFromNow(30),
    },
    {
      creatorId: users[1].id,
      title: 'Reparation velo',
      description:
        "Mon velo a un pneu creve et le derailleur est casse. Quelqu'un peut m'aider?",
      category: MissionCategory.BRICOLAGE,
      helpType: HelpType.MATERIEL,
      urgency: Urgency.FAIBLE,
      visibility: Visibility.PUBLIC,
      locationLat: 43.2965,
      locationLng: 5.3698,
      tags: ['velo', 'reparation', 'marseille'],
      expiresAt: daysFromNow(30),
    },
    {
      creatorId: users[1].id,
      title: 'Garde enfants mercredi apres-midi',
      description:
        "Cherche quelqu'un de confiance pour garder mes 2 enfants (5 et 8 ans) le mercredi apres-midi.",
      category: MissionCategory.GARDE_ENFANTS,
      helpType: HelpType.RELATION,
      urgency: Urgency.URGENT,
      visibility: Visibility.PUBLIC,
      locationLat: 43.2965,
      locationLng: 5.3698,
      tags: ['garde', 'enfants', 'mercredi'],
      expiresAt: daysFromNow(30),
    },
    {
      creatorId: users[2].id,
      title: 'Aide installation ordinateur',
      description:
        "Je viens d'acheter un PC et je ne sais pas configurer Windows ni installer mes logiciels.",
      category: MissionCategory.NUMERIQUE,
      helpType: HelpType.CONSEIL,
      urgency: Urgency.FAIBLE,
      visibility: Visibility.PUBLIC,
      locationLat: 45.764,
      locationLng: 4.8357,
      tags: ['informatique', 'installation', 'lyon'],
      expiresAt: daysFromNow(30),
    },
    {
      creatorId: users[2].id,
      title: "Besoin d'ecoute",
      description:
        "Periode difficile, j'aurais besoin de parler a quelqu'un de bienveillant.",
      category: MissionCategory.ECOUTE,
      helpType: HelpType.RELATION,
      urgency: Urgency.URGENT,
      visibility: Visibility.PRIVE,
      locationLat: 45.764,
      locationLng: 4.8357,
      tags: ['ecoute', 'soutien', 'moral'],
      expiresAt: daysFromNow(30),
    },
    {
      creatorId: users[3].id,
      title: 'Covoiturage Strasbourg-Paris',
      description:
        'Je cherche un covoiturage ou des conseils pour un trajet pas cher le weekend prochain.',
      category: MissionCategory.TRANSPORT,
      helpType: HelpType.CONSEIL,
      urgency: Urgency.MOYEN,
      visibility: Visibility.PUBLIC,
      locationLat: 48.5734,
      locationLng: 7.7521,
      tags: ['transport', 'covoiturage', 'strasbourg'],
      expiresAt: daysFromNow(30),
    },
    {
      creatorId: users[3].id,
      title: 'Cours de francais pour voisin',
      description:
        "Mon voisin vient d'arriver en France et aimerait apprendre les bases du francais.",
      category: MissionCategory.EDUCATION,
      helpType: HelpType.RELATION,
      urgency: Urgency.FAIBLE,
      visibility: Visibility.PUBLIC,
      locationLat: 48.5734,
      locationLng: 7.7521,
      tags: ['francais', 'langue', 'education'],
      expiresAt: daysFromNow(30),
    },
    {
      creatorId: users[4].id,
      title: 'Collecte alimentaire quartier',
      description:
        'On organise une collecte alimentaire pour les familles en difficulte du quartier.',
      category: MissionCategory.ALIMENTATION,
      helpType: HelpType.MATERIEL,
      urgency: Urgency.MOYEN,
      visibility: Visibility.PUBLIC,
      locationLat: 44.8378,
      locationLng: -0.5792,
      tags: ['alimentation', 'collecte', 'bordeaux'],
      expiresAt: daysFromNow(30),
    },
    {
      creatorId: users[4].id,
      title: 'Garder mon chat pendant vacances',
      description: "Je pars 10 jours en aout. Quelqu'un peut garder mon chat?",
      category: MissionCategory.ANIMAUX,
      helpType: HelpType.RELATION,
      urgency: Urgency.FAIBLE,
      visibility: Visibility.PUBLIC,
      locationLat: 44.8378,
      locationLng: -0.5792,
      tags: ['animaux', 'chat', 'garde'],
      expiresAt: daysFromNow(30),
    },
  ]);

  console.log(`Created ${missions.length} missions.`);

  // --- Contributions ---
  const contributions = await contributionRepo.save([
    {
      userId: users[1].id,
      missionId: missions[0].id,
      type: ContributionType.PARTICIPE,
      message: "Je suis dispo le 15 mars, j'ai une camionnette!",
      status: ContributionStatus.ACTIVE,
    },
    {
      userId: users[2].id,
      missionId: missions[0].id,
      type: ContributionType.PROPOSE,
      message: 'Je peux preter des couvertures de protection.',
      status: ContributionStatus.ACTIVE,
    },
    {
      userId: users[3].id,
      missionId: missions[4].id,
      type: ContributionType.CONSEILLE,
      message: "Je suis informaticien, je peux t'aider a distance.",
      status: ContributionStatus.ACTIVE,
    },
    {
      userId: users[0].id,
      missionId: missions[8].id,
      type: ContributionType.PARTICIPE,
      message: 'Je veux bien aider a la collecte!',
      status: ContributionStatus.ACTIVE,
    },
    {
      userId: users[4].id,
      missionId: missions[5].id,
      type: ContributionType.PARTICIPE,
      message: 'Je suis la si tu veux discuter.',
      status: ContributionStatus.ACTIVE,
    },
  ]);

  console.log(`Created ${contributions.length} contributions.`);

  // --- Offers ---
  const offers = await offerRepo.save([
    {
      creatorId: users[1].id,
      title: 'Pret de camionnette',
      description:
        'Je peux preter ma camionnette pour des demenagements le weekend.',
      category: MissionCategory.DEMENAGEMENT,
      offerType: OfferType.MATERIEL,
      visibility: Visibility.PUBLIC,
      locationLat: 43.2965,
      locationLng: 5.3698,
      locationRadiusKm: 30,
      status: OfferStatus.OUVERTE,
      tags: ['camionnette', 'demenagement', 'pret'],
      availability: 'Weekends uniquement',
      expiresAt: daysFromNow(60),
    },
    {
      creatorId: users[3].id,
      title: 'Aide informatique',
      description:
        "Developpeur de metier, je propose de l'aide pour tout probleme informatique.",
      category: MissionCategory.NUMERIQUE,
      offerType: OfferType.COMPETENCE,
      visibility: Visibility.PUBLIC,
      locationLat: 48.5734,
      locationLng: 7.7521,
      locationRadiusKm: 50,
      status: OfferStatus.OUVERTE,
      tags: ['informatique', 'developpeur', 'aide'],
      availability: 'Soirs en semaine',
      expiresAt: daysFromNow(60),
    },
    {
      creatorId: users[2].id,
      title: 'Ecoute et soutien',
      description:
        "Ancienne benevole dans une association d'ecoute. Disponible pour discuter.",
      category: MissionCategory.ECOUTE,
      offerType: OfferType.ECOUTE,
      visibility: Visibility.PUBLIC,
      locationLat: 45.764,
      locationLng: 4.8357,
      locationRadiusKm: 20,
      status: OfferStatus.OUVERTE,
      tags: ['ecoute', 'soutien', 'bienveillance'],
      availability: 'Flexible',
      expiresAt: daysFromNow(60),
    },
  ]);

  console.log(`Created ${offers.length} offers.`);
  console.log('Seeding complete!');

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
