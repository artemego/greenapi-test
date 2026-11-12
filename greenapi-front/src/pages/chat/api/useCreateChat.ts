import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Chat } from '@/entities/chat';
import { api, queryKeys } from '@/shared/api';

export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phoneNumber: string) => api.post<Chat>('/chats', { phoneNumber }),
    onSuccess: (chat) => {
      queryClient.setQueryData<Chat[]>(queryKeys.chats, (chats = []) =>
        chats.some((item) => item.id === chat.id) ? chats : [chat, ...chats],
      );
    },
  });
}
