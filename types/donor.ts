import { BloodType, Gender } from '@/constants/enums';

export interface Donor {
  id: string;
  deviceId: string;
  name: string;
  mobile: string | null;
  bloodType: BloodType;
  gender: Gender | null;
  dateOfBirth: string | null;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
  lastDonationDate: string | null;
  totalDonations: number;
  points: number;
  fcmToken: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterDonorDto {
  name: string;
  bloodType: BloodType;
  latitude: number;
  longitude: number;
  mobile?: string;
  gender?: Gender;
  dateOfBirth?: string;
  lastDonationDate?: string;
  fcmToken?: string;
}

export interface UpdateDonorDto {
  name?: string;
  mobile?: string;
  bloodType?: BloodType;
  gender?: Gender;
  dateOfBirth?: string;
  latitude?: number;
  longitude?: number;
  isAvailable?: boolean;
  lastDonationDate?: string;
  fcmToken?: string;
}

export interface DonorSearchParams {
  bloodType?: BloodType;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  availableOnly?: boolean;
  includeCompatible?: boolean;
  page?: number;
  limit?: number;
}

export interface DonorSearchResult extends Donor {
  distanceKm?: number;
}
