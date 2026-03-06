export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  timestamp: string;
}

export interface PaginatedData<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
