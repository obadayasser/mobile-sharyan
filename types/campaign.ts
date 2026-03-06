import { BloodType, CampaignStatus } from '@/constants/enums';

export interface Campaign {
  id: string;
  bloodBankId: string;
  title: string;
  titleAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  targetBags: number | null;
  collectedBags: number;
  bloodTypes: BloodType[] | null;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  bloodBank?: { id: string; name: string };
  registrations?: CampaignRegistration[];
}

export interface CampaignRegistration {
  id: string;
  campaignId: string;
  donorId: string;
  attended: boolean;
  donor?: { id: string; name: string; bloodType: BloodType };
}

export interface CreateCampaignDto {
  title: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  address?: string;
  targetBags?: number;
  bloodTypes?: BloodType[];
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {
  status?: CampaignStatus;
}
