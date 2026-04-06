import {
  createObjectApi,
  getObjectByIdApi,
  listObjectsApi,
} from '@/features/appointments/api/test.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetObjectById = (id: string) => {
  return useQuery({
    queryKey: ['objects', id],
    queryFn: () => getObjectByIdApi(id),
    enabled: !!id,
  });
};

export const useGetObjectList = () => {
  return useQuery({
    queryKey: ['objects'],
    queryFn: listObjectsApi,
  });
};

export const useCreateObject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createObjectApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects'] });
    },
  });
};
