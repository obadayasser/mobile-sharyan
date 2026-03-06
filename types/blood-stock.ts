import { BloodType, StockLevel } from '@/constants/enums';

export interface BloodStock {
  id: string;
  bloodBankId: string;
  bloodType: BloodType;
  bagsCount: number;
  stockLevel: StockLevel;
  updatedAt: string;
}

export interface UpdateBloodStockDto {
  bloodType: BloodType;
  bagsCount: number;
  stockLevel: StockLevel;
}

export interface ShortageAlert {
  id: string;
  bloodBankId: string;
  bloodType: BloodType;
  message: string | null;
  isResolved: boolean;
  createdAt: string;
  bloodBank?: { id: string; name: string };
}

export interface CreateShortageAlertDto {
  bloodType: BloodType;
  message?: string;
}
