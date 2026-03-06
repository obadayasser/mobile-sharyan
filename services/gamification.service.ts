import { api } from './api';
import { BadgeDefinition, GamificationSummary, LeaderboardEntry } from '@/types/gamification';
import { PaginatedData } from '@/types/api';

export const gamificationService = {
  getLeaderboard: (page = 1, limit = 20) => api.get<PaginatedData<LeaderboardEntry>>('/gamification/leaderboard', { page, limit }),
  getBadges: () => api.get<BadgeDefinition[]>('/gamification/badges'),
  getDonorSummary: (donorId: string) => api.get<GamificationSummary>(`/gamification/donor/${donorId}/summary`),
};
