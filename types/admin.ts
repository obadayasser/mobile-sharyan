export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DashboardStats {
  totalDonors: number;
  totalPatients: number;
  totalBloodBanks: number;
  totalDonations: number;
  totalBloodRequests: number;
  openRequests: number;
  pendingBloodBanks: number;
}

export interface CreateAdminDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isSuperAdmin?: boolean;
}

export interface UpdateAdminDto extends Partial<CreateAdminDto> {
  isActive?: boolean;
}
