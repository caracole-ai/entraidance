import { getToken } from './auth';
import type {
  IAuthResponse,
  IContribution,
  ICreateContribution,
  ICreateMission,
  ICreateOffer,
  ILoginRequest,
  IMission,
  IMissionFilters,
  INotification,
  IOffer,
  IPaginatedResponse,
  IRegisterRequest,
  IUser,
  ICorrelation,
} from './types';

export interface IOfferFilters {
  category?: string;
  offerType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IUserStats {
  missionsCreated: number;
  missionsResolved: number;
  contributionsGiven: number;
  offersCreated: number;
}

export interface ICloseMissionData {
  feedback?: string;
  thanks?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  
  if (!token && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
    console.warn('[API] Pas de token pour:', endpoint);
  }
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erreur serveur' }));
    console.error('[API] Erreur', res.status, endpoint, ':', error.message);
    if (res.status === 401 || res.status === 403) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:required'));
      }
      // Ne pas throw pour les erreurs d'auth, juste dispatcher l'événement
      throw new Error('AUTH_REQUIRED');
    }
    throw new Error(error.message || 'Erreur serveur');
  }
  return res.json();
}

// Auth
export const authApi = {
  login: (data: ILoginRequest) =>
    fetchApi<IAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: IRegisterRequest) =>
    fetchApi<IAuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => fetchApi<IUser>('/users/me'),
};

// Missions
export const missionsApi = {
  list: (filters?: IMissionFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return fetchApi<IPaginatedResponse<IMission>>(
      `/missions${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) => fetchApi<IMission>(`/missions/${id}`),

  create: (data: ICreateMission) =>
    fetchApi<IMission>('/missions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ICreateMission>) =>
    fetchApi<IMission>(`/missions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/missions/${id}`, { method: 'DELETE' }),

  close: (id: string, data?: ICloseMissionData) =>
    fetchApi<IMission>(`/missions/${id}/close`, {
      method: 'POST',
      body: JSON.stringify(data ?? {}),
    }),

  getContributions: (id: string) =>
    fetchApi<IContribution[]>(`/missions/${id}/contributions`),

  getCorrelations: (id: string) =>
    fetchApi<ICorrelation[]>(`/missions/${id}/correlations`),
};

// Contributions
export const contributionsApi = {
  create: (data: ICreateContribution) => {
    const { missionId, ...body } = data;
    return fetchApi<IContribution>(`/missions/${missionId}/contributions`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update: (id: string, data: Partial<ICreateContribution>) =>
    fetchApi<IContribution>(`/contributions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/contributions/${id}`, {
      method: 'DELETE',
    }),
};

// Matching
export const matchingApi = {
  getSuggestions: () =>
    fetchApi<ICorrelation[]>('/matching/suggestions'),
};

// Profile
export const profileApi = {
  getMe: () => fetchApi<IUser>('/users/me'),

  updateMe: (data: Partial<IUser>) =>
    fetchApi<IUser>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// Offers
export const offersApi = {
  list: (filters?: IOfferFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return fetchApi<IPaginatedResponse<IOffer>>(
      `/offers${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) => fetchApi<IOffer>(`/offers/${id}`),

  create: (data: ICreateOffer) =>
    fetchApi<IOffer>('/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ICreateOffer>) =>
    fetchApi<IOffer>(`/offers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    fetchApi<void>(`/offers/${id}`, { method: 'DELETE' }),

  close: (id: string) =>
    fetchApi<IOffer>(`/offers/${id}/close`, {
      method: 'POST',
    }),

  getCorrelations: (id: string) =>
    fetchApi<ICorrelation[]>(`/offers/${id}/correlations`),
};

// Notifications
export const notificationsApi = {
  list: async () => {
    const res = await fetchApi<{ data: INotification[]; total: number }>('/users/me/notifications');
    return res.data;
  },

  getUnreadCount: () =>
    fetchApi<{ count: number }>('/users/me/notifications/unread-count'),

  markRead: (id: string) =>
    fetchApi<INotification>(`/users/me/notifications/${id}`, {
      method: 'PATCH',
    }),
};

// User stats
export const statsApi = {
  get: () => fetchApi<IUserStats>('/users/me/stats'),
};
