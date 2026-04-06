// Use this test api https://restful-api.dev/
import type { DataResponse } from '@/types/api-contract.types';
import ApiClient from '../../../utils/ApiClient';

type ObjectDto = {
  id: string;
  name: string;
  data: {
    color: string;
    capacity: string;
  };
};
type CreateObjectDto = {
  name: string;
  data: {
    year: number;
    price: number;
    'CPU model': string;
    'Hard disk size': string;
  };
};
// List all the objects
export const listObjectsApi = async () => {
  const { data } = await ApiClient.get<DataResponse<ObjectDto[]>>('/objects');
  return data;
};

// Get an object by id
export const getObjectByIdApi = async (id: string) => {
  const { data } = await ApiClient.get<DataResponse<ObjectDto>>(`/objects/${id}`);
  return data;
};

// Create an object
export const createObjectApi = async (payload: CreateObjectDto) => {
  const { data } = await ApiClient.post<DataResponse<ObjectDto>>('/objects', payload);
  return data;
};
