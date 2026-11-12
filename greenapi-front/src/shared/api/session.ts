import { queryOptions, useQuery } from '@tanstack/react-query';
import { api, ApiError } from './http';
import { queryKeys } from './queryKeys';

export type Me = {
  idInstance: string;
  state: string;
};

export const meQueryOptions = queryOptions({
  queryKey: queryKeys.me,
  queryFn: async (): Promise<Me | null> => {
    try {
      return await api.get<Me>('/auth/me');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
  staleTime: Infinity,
});

export function useMe() {
  return useQuery(meQueryOptions);
}
