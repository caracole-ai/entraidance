import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';
import { Offer } from '../offers/entities/offer.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import { MissionStatus, MissionType, SkillLevel, OfferStatus, ContributionStatus } from '../common/enums';

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
      skills: ['React', 'TypeScript', 'Design UI/UX'],
      preferences: { availability: 'Weekends', location: 'Paris' },
      isDemo: true,
    },
    {
      email: 'thomas.bernard@demo.fr',
      name: 'Thomas Bernard',
      picture: 'https://i.pravatar.cc/150?img=2',
      skills: ['Node.js', 'PostgreSQL', 'DevOps'],
      preferences: { availability: 'Evenings', location: 'Lyon' },
      isDemo: true,
    },
    {
      email: 'lea.dubois@demo.fr',
      name: 'Léa Dubois',
      picture: 'https://i.pravatar.cc/150?img=3',
      skills: ['Marketing', 'Communication', 'SEO'],
      preferences: { availability: 'Full-time', location: 'Remote' },
      isDemo: true,
    },
    {
      email: 'lucas.petit@demo.fr',
      name: 'Lucas Petit',
      picture: 'https://i.pravatar.cc/150?img=4',
      skills: ['Photography', 'Video Editing', 'Storytelling'],
      preferences: { availability: 'Flexible', location: 'Marseille' },
      isDemo: true,
    },
    {
      email: 'emma.roux@demo.fr',
      name: 'Emma Roux',
      picture: 'https://i.pravatar.cc/150?img=5',
      skills: ['Project Management', 'Fundraising', 'Community Building'],
      preferences: { availability: 'Part-time', location: 'Bordeaux' },
      isDemo: true,
    },
  ]);

  console.log(`✅ Created ${users.length} demo users`);

  // Create 6 demo missions
  const missions = await missionRepo.save([
    {
      title: 'Développement site web associatif',
      description: 'Création d\'un site vitrine pour une association d\'aide aux personnes âgées',
      type: MissionType.TECH,
      status: MissionStatus.PUBLISHED,
      requiredSkills: ['React', 'TypeScript', 'Design UI/UX'],
      skillLevel: SkillLevel.INTERMEDIATE,
      estimatedHours: 40,
      location: 'Paris',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      createdBy: users[0],
      isDemo: true,
    },
    {
      title: 'Campagne marketing pour collecte de fonds',
      description: 'Aide à la création et gestion d\'une campagne marketing pour lever 50k€',
      type: MissionType.MARKETING,
      status: MissionStatus.PUBLISHED,
      requiredSkills: ['Marketing', 'Communication', 'SEO'],
      skillLevel: SkillLevel.ADVANCED,
      estimatedHours: 60,
      location: 'Remote',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 days
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      createdBy: users[1],
      isDemo: true,
    },
    {
      title: 'Reportage photo événement solidaire',
      description: 'Couverture photo/vidéo d\'un événement de soutien aux sans-abri',
      type: MissionType.CREATIVE,
      status: MissionStatus.PUBLISHED,
      requiredSkills: ['Photography', 'Video Editing'],
      skillLevel: SkillLevel.BEGINNER,
      estimatedHours: 8,
      location: 'Lyon',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      createdBy: users[2],
      isDemo: true,
    },
    {
      title: 'Gestion projet construction école au Sénégal',
      description: 'Coordination d\'un projet de construction d\'école en zone rurale',
      type: MissionType.PROJECT_MANAGEMENT,
      status: MissionStatus.PUBLISHED,
      requiredSkills: ['Project Management', 'Fundraising', 'Community Building'],
      skillLevel: SkillLevel.EXPERT,
      estimatedHours: 120,
      location: 'Dakar, Sénégal',
      startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // +60 days
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdBy: users[3],
      isDemo: true,
    },
    {
      title: 'Optimisation infrastructure cloud ONG',
      description: 'Migration et optimisation de l\'infrastructure cloud pour réduire les coûts',
      type: MissionType.TECH,
      status: MissionStatus.PUBLISHED,
      requiredSkills: ['Node.js', 'PostgreSQL', 'DevOps'],
      skillLevel: SkillLevel.ADVANCED,
      estimatedHours: 50,
      location: 'Remote',
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // +21 days
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      createdBy: users[4],
      isDemo: true,
    },
    {
      title: 'Atelier storytelling pour bénévoles',
      description: 'Animation d\'ateliers de formation au storytelling pour bénévoles',
      type: MissionType.EDUCATION,
      status: MissionStatus.PUBLISHED,
      requiredSkills: ['Storytelling', 'Communication', 'Community Building'],
      skillLevel: SkillLevel.INTERMEDIATE,
      estimatedHours: 16,
      location: 'Marseille',
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // +10 days
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdBy: users[0],
      isDemo: true,
    },
  ]);

  console.log(`✅ Created ${missions.length} demo missions`);

  // Create 4 demo offers
  const offers = await offerRepo.save([
    {
      mission: missions[0], // Dev site web
      volunteer: users[1],
      message: 'J\'ai 5 ans d\'expérience en React/TypeScript, je serais ravi de contribuer !',
      status: OfferStatus.PENDING,
      isDemo: true,
    },
    {
      mission: missions[1], // Marketing
      volunteer: users[2],
      message: 'Expérience de 3 ans en marketing digital, disponible immédiatement.',
      status: OfferStatus.ACCEPTED,
      isDemo: true,
    },
    {
      mission: missions[2], // Photo
      volunteer: users[3],
      message: 'Photographe professionnel depuis 10 ans, très motivé pour cette cause.',
      status: OfferStatus.ACCEPTED,
      isDemo: true,
    },
    {
      mission: missions[4], // DevOps
      volunteer: users[1],
      message: 'Expert DevOps avec certifications AWS/Azure, à votre disposition.',
      status: OfferStatus.PENDING,
      isDemo: true,
    },
  ]);

  console.log(`✅ Created ${offers.length} demo offers`);

  // Create 4 demo contributions (logged time)
  const contributions: Partial<Contribution>[] = [
    {
      mission: missions[1], // Marketing (accepted offer)
      volunteer: users[2],
      hours: 15,
      description: 'Création du plan marketing et première campagne réseaux sociaux',
      status: ContributionStatus.APPROVED,
      isDemo: true,
    },
    {
      mission: missions[1], // Marketing
      volunteer: users[2],
      hours: 10,
      description: 'Rédaction de contenus et gestion des publicités Facebook/Instagram',
      status: ContributionStatus.APPROVED,
      isDemo: true,
    },
    {
      mission: missions[2], // Photo (accepted offer)
      volunteer: users[3],
      hours: 8,
      description: 'Couverture complète de l\'événement + montage vidéo',
      status: ContributionStatus.APPROVED,
      isDemo: true,
    },
    {
      mission: missions[0], // Dev site (pending, but someone started)
      volunteer: users[1],
      hours: 12,
      description: 'Setup du projet Next.js + première version de la landing page',
      status: ContributionStatus.PENDING,
      isDemo: true,
    },
  ];

  await contributionRepo.save(contributions);

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
