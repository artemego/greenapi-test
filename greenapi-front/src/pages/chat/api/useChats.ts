import { queryOptions, useQuery } from '@tanstack/react-query';
import type { Chat } from '@/entities/chat';
import { api, queryKeys } from '@/shared/api';

export const chatsQueryOptions = queryOptions({
  queryKey: queryKeys.chats,
  queryFn: () => api.get<Chat[]>('/chats'),
});

export function useChats() {
  return useQuery(chatsQueryOptions);
}
