import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { api, queryKeys } from '@/shared/api';

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api.post<void>('/auth/logout'),
    onSettled: () => {
      queryClient.clear();
      queryClient.setQueryData(queryKeys.me, null);
      navigate('/login', { replace: true });
    },
  });
}
