import { useInfiniteQuery } from '@tanstack/react-query';
import type { ChatMessage } from '@/entities/message';
import { api, ApiError, queryKeys } from '@/shared/api';

export const MESSAGES_PAGE_SIZE = 50;

export function useMessages(chatId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.messages(chatId),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(MESSAGES_PAGE_SIZE) });
      if (pageParam) params.set('before', pageParam);
      return api.get<ChatMessage[]>(`/chats/${chatId}/messages?${params}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (oldestPage) =>
      oldestPage.length < MESSAGES_PAGE_SIZE ? undefined : oldestPage[0]?.sentAt,
    staleTime: Infinity,
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 1,
  });
}
