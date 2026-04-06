import type { HttpStatusCode } from '@/utils/status-codes.constants';

export interface Pagination {
  page: number;
  size: number;
  total: number;
  pages: number;
}

export interface DataResponse<T = undefined> {
  message: string;
  data?: T;
  pagination?: Pagination;
  status: HttpStatusCode;
}
