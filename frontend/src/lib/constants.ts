import { MissionCategory } from './types';

/** Minimum lengths for form validation */
export const MIN_TITLE_LENGTH = 5;
export const MIN_DESCRIPTION_LENGTH = 10;

/** Emoji icons for mission categories (shared between missions and offers forms) */
export const CATEGORY_ICONS: Partial<Record<MissionCategory, string>> = {
  [MissionCategory.DEMENAGEMENT]: '📦',
  [MissionCategory.BRICOLAGE]: '🔧',
  [MissionCategory.NUMERIQUE]: '💻',
  [MissionCategory.ADMINISTRATIF]: '📋',
  [MissionCategory.GARDE_ENFANTS]: '👶',
  [MissionCategory.TRANSPORT]: '🚗',
  [MissionCategory.ECOUTE]: '👂',
  [MissionCategory.EMPLOI]: '💼',
  [MissionCategory.ALIMENTATION]: '🍽️',
  [MissionCategory.ANIMAUX]: '🐾',
  [MissionCategory.EDUCATION]: '📚',
  [MissionCategory.HANDICAP]: '♿',
  [MissionCategory.AUTRE]: '✨',
};
