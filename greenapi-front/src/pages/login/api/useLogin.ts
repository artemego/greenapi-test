import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { api, queryKeys, type Me } from '@/shared/api';

export type LoginInput = {
  idInstance: string;
  apiTokenInstance: string;
};

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: LoginInput) => api.post<Me>('/auth/login', input),
    onSuccess: (me) => {
      queryClient.setQueryData(queryKeys.me, me);
      navigate('/', { replace: true });
    },
  });
}
