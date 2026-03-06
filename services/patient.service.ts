import { api } from './api';
import { Patient, RegisterPatientDto, UpdatePatientDto } from '@/types/patient';
import { PaginatedData } from '@/types/api';
import { BloodRequest } from '@/types/blood-request';

export const patientService = {
  register: (data: RegisterPatientDto) => api.post<Patient>('/patients/register', data),
  getMe: () => api.get<Patient>('/patients/me'),
  updateMe: (data: UpdatePatientDto) => api.patch<Patient>('/patients/me', data),
  getMyRequests: (page = 1, limit = 20) => api.get<PaginatedData<BloodRequest>>('/patients/me/requests', { page, limit }),
  updateFcmToken: (fcmToken: string) => api.patch<void>('/patients/me/fcm-token', { fcmToken }),
};
