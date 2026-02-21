export interface IUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  locationLat?: number;
  locationLng?: number;
  isPremium: boolean;
  oauthProvider?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IUserStats {
  missionsCreated: number;
  missionsResolved: number;
  contributionsGiven: number;
  offersCreated: number;
}
