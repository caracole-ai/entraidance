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
    email: 'demo.alice@entraidance.test',
    displayName: 'Alice Martin',
    bio: 'Developpeuse web passionnee par l\'entraide locale. Competences en React, Node.js.',
    skills: ['developpement web', 'react', 'javascript', 'design'],
    interests: ['technologie', 'jardinage', 'cuisine'],
    locationLat: 48.8566,
    locationLng: 2.3522,
    isPremium: false,
    isDemo: true,
  },
  {
    email: 'demo.bob@entraidance.test',
    displayName: 'Bob Durand',
    bio: 'Bricoleur chevronne et retraite disponible pour depanner.',
    skills: ['bricolage', 'electricite', 'plomberie'],
    interests: ['bricolage', 'jardinage', 'marche'],
    locationLat: 48.8566,
    locationLng: 2.3522,
    isPremium: true,
    isDemo: true,
  },
  {
    email: 'demo.claire@entraidance.test',
    displayName: 'Claire Dubois',
    bio: 'Professeure de francais, j\'aime aider les jeunes a progresser.',
    skills: ['francais', 'soutien scolaire', 'redaction'],
    interests: ['litterature', 'musique', 'randonnee'],
    locationLat: 45.764,
    locationLng: 4.8357,
    isPremium: false,
    isDemo: true,
  },
  {
    email: 'demo.david@entraidance.test',
    displayName: 'David Petit',
    bio: 'Graphiste freelance, disponible pour des conseils creatifs.',
    skills: ['design graphique', 'photoshop', 'illustration'],
    interests: ['art', 'photographie', 'cafe'],
    locationLat: 43.2965,
    locationLng: 5.3698,
    isPremium: true,
    isDemo: true,
  },
  {
    email: 'demo.emma@entraidance.test',
    displayName: 'Emma Rousseau',
    bio: 'Etudiante en medecine, j\'adore cuisiner et partager mes recettes.',
    skills: ['cuisine', 'nutrition', 'organisation'],
    interests: ['sante', 'sport', 'cuisine'],
    locationLat: 48.8566,
    locationLng: 2.3522,
    isPremium: false,
    isDemo: true,
  },
];

const demoMissions = [
  {
    title: 'Aide pour demenagement ce week-end',
    description: 'Je cherche 2-3 personnes pour m\'aider a demenager un canape et quelques cartons. Pas d\'etages, rez-de-chaussee. Je fournis les boissons et pizzas !',
    category: MissionCategory.TRANSPORT,
    helpType: HelpType.MATERIEL,
    urgency: Urgency.URGENT,
    visibility: Visibility.PUBLIC,
    tags: ['demenagement', 'force', 'week-end'],
    locationLat: 48.8566,
    locationLng: 2.3522,
    status: MissionStatus.OUVERTE,
    isDemo: true,
  },
  {
    title: 'Recherche accompagnement pour rendez-vous medical',
    description: 'Personne agee cherche quelqu\'un pour l\'accompagner a un rendez-vous chez le cardiologue mardi prochain a 14h.',
    category: MissionCategory.TRANSPORT,
    helpType: HelpType.RELATION,
    urgency: Urgency.MOYEN,
    visibility: Visibility.PUBLIC,
    tags: ['sante', 'accompagnement', 'personnes agees'],
    locationLat: 48.8566,
    locationLng: 2.3522,
    status: MissionStatus.OUVERTE,
    isDemo: true,
  },
  {
    title: 'Besoin d\'aide pour reparer un robinet qui fuit',
    description: 'Le robinet de ma cuisine fuit depuis hier. Je n\'y connais rien en plomberie. Quelqu\'un peut m\'aider ou me conseiller ?',
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
    title: 'Soutien scolaire en maths pour collegien',
    description: 'Mon fils (13 ans) a du mal en maths. Recherche quelqu\'un pour l\'aider 1h par semaine, niveau 4eme.',
    category: MissionCategory.EDUCATION,
    helpType: HelpType.CONSEIL,
    urgency: Urgency.FAIBLE,
    visibility: Visibility.PUBLIC,
    tags: ['soutien scolaire', 'maths', 'college'],
    locationLat: 43.2965,
    locationLng: 5.3698,
    status: MissionStatus.OUVERTE,
    isDemo: true,
  },
  {
    title: 'Aide pour creer un site web simple',
    description: 'Je voudrais creer un petit site vitrine pour mon activite artisanale. Cherche quelqu\'un pour me guider ou m\'aider.',
    category: MissionCategory.NUMERIQUE,
    helpType: HelpType.CONSEIL,
    urgency: Urgency.FAIBLE,
    visibility: Visibility.PUBLIC,
    tags: ['web', 'numerique', 'artisanat'],
    locationLat: 48.8566,
    locationLng: 2.3522,
    status: MissionStatus.EN_COURS,
    progressPercent: 30,
    isDemo: true,
  },
  {
    title: 'Recherche compagnie pour promenade quotidienne',
    description: 'Personne agee cherche quelqu\'un pour discuter et se promener 30 minutes par jour dans le quartier.',
    category: MissionCategory.ECOUTE,
    helpType: HelpType.RELATION,
    urgency: Urgency.MOYEN,
    visibility: Visibility.PUBLIC,
    tags: ['social', 'promenade', 'personnes agees'],
    locationLat: 48.8566,
    locationLng: 2.3522,
    status: MissionStatus.OUVERTE,
    isDemo: true,
  },
];

const demoOffers = [
  {
    title: 'Cours de francais gratuits pour adultes',
    description: 'Je propose des cours de francais langue etrangere ou aide a la redaction. Disponible les mercredis apres-midi.',
    category: MissionCategory.EDUCATION,
    offerType: OfferType.COMPETENCE,
    visibility: Visibility.PUBLIC,
    tags: ['francais', 'cours', 'gratuit'],
    availability: 'Mercredis 14h-18h',
    locationLat: 45.764,
    locationLng: 4.8357,
    status: OfferStatus.OUVERTE,
    isDemo: true,
  },
  {
    title: 'Aide au bricolage et petits travaux',
    description: 'Retraite disponible pour donner un coup de main en bricolage : montage meubles, petite electricite, etc.',
    category: MissionCategory.BRICOLAGE,
    offerType: OfferType.COMPETENCE,
    visibility: Visibility.PUBLIC,
    tags: ['bricolage', 'electricite', 'aide'],
    availability: 'Flexible, week-ends preferes',
    locationLat: 48.8566,
    locationLng: 2.3522,
    status: OfferStatus.OUVERTE,
    isDemo: true,
  },
  {
    title: 'Design graphique et retouche photo',
    description: 'Graphiste pro propose aide pour creer logos, flyers ou retoucher photos. Premier conseil gratuit.',
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
    title: 'Pret d\'outils de jardinage',
    description: 'Je prete tondeuse, taille-haie, beche, rateau. Disponible pour voisins du quartier.',
    category: MissionCategory.AUTRE,
    offerType: OfferType.MATERIEL,
    visibility: Visibility.PUBLIC,
    tags: ['jardinage', 'pret', 'outils'],
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
  const contributions: Contribution[] = [];

  // Mission 0: demenagement → 2 interested
  contributions.push(
    contributionRepo.create({
      userId: users[1].id,
      missionId: missions[0].id,
      type: ContributionType.PARTICIPE,
      message: 'Je suis dispo samedi matin ! 💪',
      status: ContributionStatus.ACTIVE,
      isDemo: true,
    }),
  );
  contributions.push(
    contributionRepo.create({
      userId: users[3].id,
      missionId: missions[0].id,
      type: ContributionType.PARTICIPE,
      message: 'Je peux venir aider, j\'ai une camionnette.',
      status: ContributionStatus.ACTIVE,
      isDemo: true,
    }),
  );

  // Mission 2: plomberie → 1 volunteer
  contributions.push(
    contributionRepo.create({
      userId: users[1].id,
      missionId: missions[2].id,
      type: ContributionType.PARTICIPE,
      message: 'Je passe demain apres-midi avec mes outils !',
      status: ContributionStatus.ACTIVE,
      isDemo: true,
    }),
  );

  // Mission 4: site web → 1 volunteer (Alice dev)
  contributions.push(
    contributionRepo.create({
      userId: users[0].id,
      missionId: missions[4].id,
      type: ContributionType.PARTICIPE,
      message: 'Je peux t\'aider a creer un site avec un template gratuit.',
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
