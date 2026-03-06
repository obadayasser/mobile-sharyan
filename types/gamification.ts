import { BadgeType, BloodType } from '@/constants/enums';

export interface BadgeDefinition {
  badge: BadgeType;
  name: string;
  description: string;
  requirement: number;
}

export interface DonorBadge {
  id: string;
  donorId: string;
  badge: BadgeType;
  earnedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  bloodType: BloodType;
  totalDonations: number;
  points: number;
}

export interface GamificationSummary {
  points: number;
  totalDonations: number;
  badges: { badge: BadgeType; earnedAt: string }[];
  nextBadge: { badge: BadgeType; remaining: number } | null;
}

export interface PointTransaction {
  id: string;
  donorId: string;
  points: number;
  reason: string;
  createdAt: string;
}
