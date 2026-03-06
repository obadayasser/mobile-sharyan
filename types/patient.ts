export interface Patient {
  id: string;
  deviceId: string;
  name: string;
  mobile: string | null;
  latitude: number | null;
  longitude: number | null;
  fcmToken: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPatientDto {
  name: string;
  mobile?: string;
  latitude?: number;
  longitude?: number;
  fcmToken?: string;
}

export interface UpdatePatientDto {
  name?: string;
  mobile?: string;
  latitude?: number;
  longitude?: number;
  fcmToken?: string;
}
