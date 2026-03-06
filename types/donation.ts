import { BloodType } from '@/constants/enums';

export interface Donation {
  id: string;
  donorId: string;
  bloodRequestId: string | null;
  donationOfferId: string | null;
  bloodType: BloodType;
  bagsCount: number;
  hospitalName: string | null;
  notes: string | null;
  donatedAt: string;
  createdAt: string;
  donor?: { id: string; name: string };
}

export interface CreateDonationDto {
  donorId: string;
  bloodType: BloodType;
  bagsCount?: number;
  hospitalName?: string;
  notes?: string;
  donatedAt?: string;
}

export interface DonationStats {
  totalDonations: number;
  totalBags: number;
  donationsThisMonth: number;
  topDonors: { id: string; name: string; totalDonations: number }[];
}
