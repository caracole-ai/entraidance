// Enums

export enum MissionStatus {
  OUVERTE = 'ouverte',
  EN_COURS = 'en_cours',
  RESOLUE = 'resolue',
  EXPIREE = 'expiree',
}

export enum HelpType {
  FINANCIERE = 'financiere',
  CONSEIL = 'conseil',
  MATERIEL = 'materiel',
  RELATION = 'relation',
  AUTRE = 'autre',
}

export enum Urgency {
  FAIBLE = 'faible',
  MOYEN = 'moyen',
  URGENT = 'urgent',
}

export enum Visibility {
  PUBLIC = 'public',
  GROUPE = 'groupe',
  PRIVE = 'prive',
}

export enum MissionCategory {
  DEMENAGEMENT = 'demenagement',
  BRICOLAGE = 'bricolage',
  NUMERIQUE = 'numerique',
  ADMINISTRATIF = 'administratif',
  GARDE_ENFANTS = 'garde_enfants',
  TRANSPORT = 'transport',
  ECOUTE = 'ecoute',
  EMPLOI = 'emploi',
  ALIMENTATION = 'alimentation',
  ANIMAUX = 'animaux',
  EDUCATION = 'education',
  HANDICAP = 'handicap',
  AUTRE = 'autre',
}

export enum ContributionType {
  PARTICIPE = 'participe',
  PROPOSE = 'propose',
  FINANCE = 'finance',
  CONSEILLE = 'conseille',
}

export enum ContributionStatus {
  ACTIVE = 'active',
  TERMINEE = 'terminee',
  ANNULEE = 'annulee',
}

export enum OfferType {
  DON = 'don',
  COMPETENCE = 'competence',
  MATERIEL = 'materiel',
  SERVICE = 'service',
  ECOUTE = 'ecoute',
}

export enum OfferStatus {
  OUVERTE = 'ouverte',
  EN_COURS = 'en_cours',
  CLOTUREE = 'cloturee',
  EXPIREE = 'expiree',
}

// Interfaces

export interface IUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  oauthProvider?: string | null;
  skills?: string[];
  interests?: string[];
  availabilityHours?: number;
  maxDistanceKm?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IMission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  helpType: HelpType;
  urgency: Urgency;
  visibility: Visibility;
  status: MissionStatus;
  tags: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
  progressPercent: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  creator: IUser;
  creatorId: string;
  contributionsCount: number;
}

export interface IContribution {
  id: string;
  type: ContributionType;
  status: ContributionStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
  user: IUser;
  userId: string;
  mission: IMission;
  missionId: string;
}

export interface IOffer {
  id: string;
  title: string;
  description: string;
  offerType: OfferType;
  status: OfferStatus;
  category?: MissionCategory;
  availability?: string;
  visibility?: Visibility;
  tags: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  creator: IUser;
  creatorId: string;
}

export interface INotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
  userId: string;
  referenceType?: string;
  referenceId?: string;
}

export interface ICorrelation {
  id: string;
  score: number;
  mission: IMission;
  missionId: string;
  offer: IOffer;
  offerId: string;
  createdAt: string;
}

// DTOs

export interface ICreateMission {
  title: string;
  description: string;
  category: MissionCategory;
  helpType: HelpType;
  urgency: Urgency;
  visibility: Visibility;
  tags: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface ICreateContribution {
  type: ContributionType;
  message?: string;
  missionId: string;
}

export interface ICreateOffer {
  title: string;
  description: string;
  offerType: OfferType;
  category?: MissionCategory;
  availability?: string;
  visibility?: Visibility;
  tags: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface IMissionFilters {
  category?: MissionCategory;
  helpType?: HelpType;
  urgency?: Urgency;
  status?: MissionStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IAuthResponse {
  accessToken: string;
  user: IUser;
}

export interface IRegisterRequest {
  displayName: string;
  email: string;
  password: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Label maps

export const CATEGORY_LABELS: Record<MissionCategory, string> = {
  [MissionCategory.DEMENAGEMENT]: 'Demenagement',
  [MissionCategory.BRICOLAGE]: 'Bricolage',
  [MissionCategory.NUMERIQUE]: 'Numerique',
  [MissionCategory.ADMINISTRATIF]: 'Administratif',
  [MissionCategory.GARDE_ENFANTS]: "Garde d'enfants",
  [MissionCategory.TRANSPORT]: 'Transport',
  [MissionCategory.ECOUTE]: 'Ecoute',
  [MissionCategory.EMPLOI]: 'Emploi',
  [MissionCategory.ALIMENTATION]: 'Alimentation',
  [MissionCategory.ANIMAUX]: 'Animaux',
  [MissionCategory.EDUCATION]: 'Education',
  [MissionCategory.HANDICAP]: 'Handicap',
  [MissionCategory.AUTRE]: 'Autre',
};

export const URGENCY_LABELS: Record<Urgency, string> = {
  [Urgency.FAIBLE]: 'Faible',
  [Urgency.MOYEN]: 'Moyen',
  [Urgency.URGENT]: 'Urgent',
};

export const HELP_TYPE_LABELS: Record<HelpType, string> = {
  [HelpType.FINANCIERE]: 'Financiere',
  [HelpType.CONSEIL]: 'Conseil',
  [HelpType.MATERIEL]: 'Materiel',
  [HelpType.RELATION]: 'Relation',
  [HelpType.AUTRE]: 'Autre',
};

export const CONTRIBUTION_TYPE_LABELS: Record<ContributionType, string> = {
  [ContributionType.PARTICIPE]: 'Je participe',
  [ContributionType.PROPOSE]: 'Je propose',
  [ContributionType.FINANCE]: 'Je finance',
  [ContributionType.CONSEILLE]: 'Je conseille',
};

export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  [OfferType.DON]: 'Don',
  [OfferType.COMPETENCE]: 'Competence',
  [OfferType.MATERIEL]: 'Materiel',
  [OfferType.SERVICE]: 'Service',
  [OfferType.ECOUTE]: 'Ecoute',
};

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  [Visibility.PUBLIC]: 'Public',
  [Visibility.GROUPE]: 'Groupe',
  [Visibility.PRIVE]: 'Prive',
};
