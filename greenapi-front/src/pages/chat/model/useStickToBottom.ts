import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/entities/message';

const NEAR_BOTTOM_PX = 120;

type Snapshot = {
  firstId?: string;
  lastId?: string;
  scrollHeight: number;
  nearBottom: boolean;
};

export function useStickToBottom(messages: ChatMessage[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const snapshot = useRef<Snapshot>({ scrollHeight: 0, nearBottom: true });
  const [scrolledUp, setScrolledUp] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const previous = snapshot.current;
    const first = messages[0];
    const last = messages.at(-1);

    if (!previous.lastId) {
      container.scrollTop = container.scrollHeight;
    } else if (first?.id !== previous.firstId && last?.id === previous.lastId) {
      container.scrollTop += container.scrollHeight - previous.scrollHeight;
    } else if (
      last &&
      last.id !== previous.lastId &&
      (previous.nearBottom || last.status === 'sending')
    ) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }

    snapshot.current = {
      firstId: first?.id,
      lastId: last?.id,
      scrollHeight: container.scrollHeight,
      nearBottom: previous.nearBottom,
    };
  }, [messages]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distance < NEAR_BOTTOM_PX;
    snapshot.current.nearBottom = nearBottom;
    setScrolledUp(!nearBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, []);

  return { containerRef, handleScroll, scrolledUp, scrollToBottom };
}
