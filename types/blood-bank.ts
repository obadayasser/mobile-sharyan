import { BloodBankStatus } from '@/constants/enums';

export interface BloodBank {
  id: string;
  deviceId: string;
  name: string;
  nameAr: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  licenseNumber: string | null;
  latitude: number;
  longitude: number;
  status: BloodBankStatus;
  fcmToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterBloodBankDto {
  name: string;
  latitude: number;
  longitude: number;
  nameAr?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  licenseNumber?: string;
  fcmToken?: string;
}

export interface UpdateBloodBankDto extends Partial<RegisterBloodBankDto> {}
