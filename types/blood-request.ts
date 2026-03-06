import { BloodType, BloodRequestStatus, BloodRequestUrgency, DonationOfferStatus } from '@/constants/enums';

export interface BloodRequest {
  id: string;
  patientId: string;
  bloodType: BloodType;
  bagsNeeded: number;
  bagsFulfilled: number;
  urgency: BloodRequestUrgency;
  status: BloodRequestStatus;
  patientName: string;
  hospitalName: string | null;
  latitude: number;
  longitude: number;
  contactPhone: string | null;
  notes: string | null;
  bloodBankId: string | null;
  shareToken: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: { id: string; name: string };
  offers?: DonationOffer[];
}

export interface CreateBloodRequestDto {
  bloodType: BloodType;
  bagsNeeded: number;
  patientName: string;
  latitude: number;
  longitude: number;
  urgency?: BloodRequestUrgency;
  hospitalName?: string;
  bloodBankId?: string;
  contactPhone?: string;
  notes?: string;
}

export interface UpdateBloodRequestDto {
  hospitalName?: string;
  contactPhone?: string;
  notes?: string;
  status?: BloodRequestStatus;
  bagsFulfilled?: number;
}

export interface BloodRequestSearchParams {
  bloodType?: BloodType;
  status?: BloodRequestStatus;
  urgency?: BloodRequestUrgency;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}

export interface DonationOffer {
  id: string;
  bloodRequestId: string;
  donorId: string;
  status: DonationOfferStatus;
  message: string | null;
  donor?: { id: string; name: string; bloodType: BloodType };
  bloodRequest?: BloodRequest;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDonationOfferDto {
  bloodRequestId: string;
  message?: string;
}

export interface NotifyDonorsResponse {
  request: BloodRequest;
  donors: { id: string; name: string; bloodType: BloodType; distanceKm: number }[];
  compatibleTypes: BloodType[];
}
