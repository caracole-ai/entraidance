import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Mission } from '../../missions/entities/mission.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Contribution } from '../../contributions/entities/contribution.entity';
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
} from '../../shared/enums';

const demoUsers = [
  {
    email: 'demo.alice@gr-attitude.test',
    displayName: 'Alice Martin',
    bio: 'Développeuse web passionnée par l'entraide locale. Compétences en React, Node.js.',
    skills: ['développement web', 'react', 'javascript', 'design'],
    interests: ['technologie', 'jardinage', 'cuisine'],
    locationLat: 48.8566,
    locationLng: 2.3522, // Paris
    isPremium: false,
    isDemo: true,
  },
  {
    email: 'demo.bob@gr-attitude.test',
    displayName: 'Bob Durand',
    bio: 'Bricoleur chevronné et retraité disponible pour dépanner.',
    skills: ['bricolage', 'électricité', 'plomberie'],
    interests: ['bricolage', 'jardinage', 'marche'],
    locationLat: 48.8566,
    locationLng: 2.3522,
    isPremium: true,
    isDemo: true,
  },
  {
    email: 'demo.claire@gr-attitude.test',
    displayName: 'Claire Dubois',
    bio: 'Professeure de français, j'aime aider les jeunes à progresser.',
    skills: ['français', 'soutien scolaire', 'rédaction'],
    interests: ['littérature', 'musique', 'randonnée'],
    locationLat: 45.764,
    locationLng: 4.8357, // Lyon
    isPremium: false,
    isDemo: true,
  },
  {
    email: 'demo.david@gr-attitude.test',
    displayName: 'David Petit',
    bio: 'Graphiste freelance, disponible pour des conseils créatifs.',
    skills: ['design graphique', 'photoshop', 'illustration'],
    interests: ['art', 'photographie', 'café'],
    locationLat: 43.2965,
    locationLng: 5.3698, // Marseille
    isPremium: true,
    isDemo: true,
  },
  {
    email: 'demo.emma@gr-attitude.test',
    displayName: 'Emma Rousseau',
    bio: 'Étudiante en médecine, j'adore cuisiner et partager mes recettes.',
    skills: ['cuisine', 'nutrition', 'organisation'],
    interests: ['santé', 'sport', 'cuisine'],
    locationLat: 48.8566,
    locationLng: 2.3522,
    isPremium: false,
    isDemo: true,
  },
];

const demoMissions = [
  {
    title: 'Aide pour déménagement ce week-end',
    description:
      'Je cherche 2-3 personnes pour m'aider à déménager un canapé et quelques cartons. Pas d'étages, rez-de-chaussée. Je fournis les boissons et pizzas !',
    category: MissionCategory.TRANSPORT,
    helpType: HelpType.AIDE_PONCTUELLE,
    urgency: Urgency.URGENT,
    visibility: Visibility.PUBLIC,
    tags: ['déménagement', 'force', 'week-end'],
    locationLat: 48.8566,
    locationLng: 2.3522,
    status: MissionStatus.OUVERTE,
    isDemo: true,
  },
  {
    title: 'Recherche accompagnement pour rendez-vous médical',
    description:
      'Personne âgée cherche quelqu'un pour l'accompagner à un rendez-vous chez le cardiologue mardi prochain à 14h.',
    category: MissionCategory.SANTE,
    helpType: HelpType.ACCOMPAGNEMENT,
    urgency: Urgency.MOYEN,
    visibility: Visibility.PUBLIC,
    tags: ['santé', 'accompagnement', 'personnes âgées'],
    locationLat: 48.8566,
    locationLng: 2.3522,
    status: MissionStatus.OUVERTE,
    isDemo: true,
  },
  {
    title: 'Besoin d'aide pour réparer un robinet qui fuit',
    description:
      'Le robinet de ma cuisine fuit depuis hier. Je n'y connais rien en plomberie. Quelqu'un peut m'aider ou me conseiller ?',
    category: MissionCategory.BRICOLAGE,
    helpType: HelpType.CONSEIL,
    urgency: Urgency.MOYEN,
    visibility: Visibility.PUBLIC,
    tags: ['plomberie', 'bricolage', 'urgent'],
    locationLat: 45.764,
    locationLng: 4.8357,
    status: MissionStatus.OUVERTE,
    isDemo: true,
  },
  {
    title: 'Soutien scolaire en maths pour collégien',
    description:
      'Mon fils (13 ans) a du mal en maths. Recherche quelqu'un pour l'aider 1h par semaine, niveau 4ème.',
    category: MissionCategory.EDUCATION,
    helpType: HelpType.FORMATION,
    urgency: Urgency.PAS_URGENT,
    visibility: Visibility.PUBLIC,
    tags: ['soutien scolaire', 'maths', 'collège'],
    locationLat: 43.2965,
    locationLng: 5.3698,
    status: MissionStatus.OUVERTE,
    isDemo: true,
  },
  {
    title: 'Aide pour créer un site web simple',
    description:
      'Je voudrais créer un petit site vitrine pour mon activité artisanale. Cherche quelqu'un pour me guider ou m'aider.',
    category: MissionCategory.NUMERIQUE,
    helpType: HelpType.CONSEIL,
    urgency: Urgency.PAS_URGENT,
    visibility: Visibility.PUBLIC,
    tags: ['web', 'numérique', 'artisanat'],
    locationLat: 48.8566,
    locationLng: 2.3522,
    status: MissionStatus.EN_COURS,
    progressPercent: 30,
    isDemo: true,
  },
  {
    title: 'Recherche compagnie pour promenade quotidienne',
    description:
      'Personne âgée cherche quelqu'un pour discuter et se promener 30 minutes par jour dans le quartier.',
    category: MissionCategory.SOCIAL,
    helpType: HelpType.ACCOMPAGNEMENT,
    urgency: Urgency.MOYEN,
    visibility: Visibility.PUBLIC,
    tags: ['social', 'promenade', 'personnes âgées'],
    locationLat: 48.8566,
    locationLng: 2.3522,
    status: MissionStatus.OUVERTE,
    isDemo: true,
  },
];

const demoOffers = [
  {
    title: 'Cours de français gratuits pour adultes',
    description:
      'Je propose des cours de français langue étrangère ou aide à la rédaction. Disponible les mercredis après-midi.',
    category: MissionCategory.EDUCATION,
    offerType: OfferType.COMPETENCE,
    visibility: Visibility.PUBLIC,
    tags: ['français', 'cours', 'gratuit'],
    availability: 'Mercredis 14h-18h',
    locationLat: 45.764,
    locationLng: 4.8357,
    status: OfferStatus.OUVERTE,
    isDemo: true,
  },
  {
    title: 'Aide au bricolage et petits travaux',
    description:
      'Retraité disponible pour donner un coup de main en bricolage : montage meubles, petite électricité, etc.',
    category: MissionCategory.BRICOLAGE,
    offerType: OfferType.TEMPS,
    visibility: Visibility.PUBLIC,
    tags: ['bricolage', 'électricité', 'aide'],
    availability: 'Flexible, week-ends préférés',
    locationLat: 48.8566,
    locationLng: 2.3522,
    status: OfferStatus.OUVERTE,
    isDemo: true,
  },
  {
    title: 'Design graphique et retouche photo',
    description:
      'Graphiste pro propose aide pour créer logos, flyers ou retoucher photos. Premier conseil gratuit.',
    category: MissionCategory.NUMERIQUE,
    offerType: OfferType.COMPETENCE,
    visibility: Visibility.PUBLIC,
    tags: ['design', 'graphisme', 'photo'],
    availability: 'Soirs et week-ends',
    locationLat: 43.2965,
    locationLng: 5.3698,
    status: OfferStatus.OUVERTE,
    isDemo: true,
  },
  {
    title: 'Prêt d'outils de jardinage',
    description:
      'Je prête tondeuse, taille-haie, bêche, râteau. Disponible pour voisins du quartier.',
    category: MissionCategory.AUTRE,
    offerType: OfferType.MATERIEL,
    visibility: Visibility.PUBLIC,
    tags: ['jardinage', 'prêt', 'outils'],
    availability: 'Sur demande',
    locationLat: 48.8566,
    locationLng: 2.3522,
    status: OfferStatus.OUVERTE,
    isDemo: true,
  },
];

export async function seedDemoData(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const missionRepo = dataSource.getRepository(Mission);
  const offerRepo = dataSource.getRepository(Offer);
  const contributionRepo = dataSource.getRepository(Contribution);

  console.log('🌱 Seeding demo data...');

  // 1. Create demo users
  console.log('  → Creating demo users...');
  const users = await userRepo.save(
    demoUsers.map((u) => userRepo.create(u)),
  );
  console.log(`  ✅ Created ${users.length} demo users`);

  // 2. Create demo missions
  console.log('  → Creating demo missions...');
  const missions = await missionRepo.save(
    demoMissions.map((m, idx) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      return missionRepo.create({
        ...m,
        creatorId: users[idx % users.length].id,
        expiresAt,
      });
    }),
  );
  console.log(`  ✅ Created ${missions.length} demo missions`);

  // 3. Create demo offers
  console.log('  → Creating demo offers...');
  const offers = await offerRepo.save(
    demoOffers.map((o, idx) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60);
      return offerRepo.create({
        ...o,
        creatorId: users[(idx + 1) % users.length].id,
        expiresAt,
      });
    }),
  );
  console.log(`  ✅ Created ${offers.length} demo offers`);

  // 4. Create some demo contributions
  console.log('  → Creating demo contributions...');
  const contributions = [];

  // Mission 0: déménagement → 2 interested
  contributions.push(
    contributionRepo.create({
      userId: users[1].id, // Bob (bricoleur)
      missionId: missions[0].id,
      type: ContributionType.INTERESTED,
      message: 'Je suis dispo samedi matin ! 💪',
      status: ContributionStatus.ACTIVE,
      isDemo: true,
    }),
  );
  contributions.push(
    contributionRepo.create({
      userId: users[3].id, // David
      missionId: missions[0].id,
      type: ContributionType.INTERESTED,
      message: 'Je peux venir aider, j'ai une camionnette.',
      status: ContributionStatus.ACTIVE,
      isDemo: true,
    }),
  );

  // Mission 2: plomberie → 1 volunteer
  contributions.push(
    contributionRepo.create({
      userId: users[1].id, // Bob (bricoleur)
      missionId: missions[2].id,
      type: ContributionType.VOLUNTEER,
      message: 'Je passe demain après-midi avec mes outils !',
      status: ContributionStatus.ACTIVE,
      isDemo: true,
    }),
  );

  // Mission 4: site web → 1 volunteer (Alice dev)
  contributions.push(
    contributionRepo.create({
      userId: users[0].id, // Alice (dev web)
      missionId: missions[4].id,
      type: ContributionType.VOLUNTEER,
      message: 'Je peux t'aider à créer un site avec un template gratuit.',
      status: ContributionStatus.ACTIVE,
      isDemo: true,
    }),
  );

  await contributionRepo.save(contributions);
  console.log(`  ✅ Created ${contributions.length} demo contributions`);

  console.log('🎉 Demo data seeded successfully!');
}

export async function clearDemoData(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const missionRepo = dataSource.getRepository(Mission);
  const offerRepo = dataSource.getRepository(Offer);
  const contributionRepo = dataSource.getRepository(Contribution);

  console.log('🧹 Clearing demo data...');

  const deletedContributions = await contributionRepo.delete({ isDemo: true });
  console.log(
    `  ✅ Deleted ${deletedContributions.affected || 0} demo contributions`,
  );

  const deletedMissions = await missionRepo.delete({ isDemo: true });
  console.log(`  ✅ Deleted ${deletedMissions.affected || 0} demo missions`);

  const deletedOffers = await offerRepo.delete({ isDemo: true });
  console.log(`  ✅ Deleted ${deletedOffers.affected || 0} demo offers`);

  const deletedUsers = await userRepo.delete({ isDemo: true });
  console.log(`  ✅ Deleted ${deletedUsers.affected || 0} demo users`);

  console.log('🎉 Demo data cleared successfully!');
}
