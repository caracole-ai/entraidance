// Mission enums
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

// Offer enums
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

// Contribution enums
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

// Notification enums
export enum NotificationType {
  NEW_CONTRIBUTION = 'new_contribution',
  MISSION_CLOSED = 'mission_closed',
  MISSION_EXPIRING = 'mission_expiring',
  MISSION_EXPIRED = 'mission_expired',
  CORRELATION_FOUND = 'correlation_found',
  THANKS_RECEIVED = 'thanks_received',
}

export enum ReferenceType {
  MISSION = 'mission',
  OFFER = 'offer',
  CONTRIBUTION = 'contribution',
}
