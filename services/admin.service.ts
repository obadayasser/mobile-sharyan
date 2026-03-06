import { api } from './api';
import { DashboardStats, Admin, CreateAdminDto, UpdateAdminDto } from '@/types/admin';
import { PaginatedData } from '@/types/api';
import { Donor } from '@/types/donor';
import { Patient } from '@/types/patient';
import { BloodRequest } from '@/types/blood-request';

export const adminService = {
  getDashboard: () => api.get<DashboardStats>('/admin/dashboard'),
  listAdmins: (page = 1, limit = 20) => api.get<PaginatedData<Admin>>('/admin/admins', { page, limit }),
  createAdmin: (data: CreateAdminDto) => api.post<Admin>('/admin/admins', data),
  updateAdmin: (id: string, data: UpdateAdminDto) => api.patch<Admin>(`/admin/admins/${id}`, data),
  deleteAdmin: (id: string) => api.del<void>(`/admin/admins/${id}`),
  listDonors: (page = 1, limit = 20) => api.get<PaginatedData<Donor>>('/admin/donors', { page, limit }),
  listPatients: (page = 1, limit = 20) => api.get<PaginatedData<Patient>>('/admin/patients', { page, limit }),
  listBloodRequests: (page = 1, limit = 20) => api.get<PaginatedData<BloodRequest>>('/admin/blood-requests', { page, limit }),
  toggleDonorActive: (id: string) => api.patch<void>(`/admin/donors/${id}/toggle-active`),
  togglePatientActive: (id: string) => api.patch<void>(`/admin/patients/${id}/toggle-active`),
};
