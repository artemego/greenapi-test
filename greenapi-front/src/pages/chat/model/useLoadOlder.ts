import { useEffect, useRef, type RefObject } from 'react';

type LoadOlderOptions = {
  containerRef: RefObject<HTMLElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
};

export function useLoadOlder({
  containerRef,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: LoadOlderOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = containerRef.current;
    if (!sentinel || !root || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage();
      },
      { root, rootMargin: '300px 0px 0px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [containerRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return sentinelRef;
}
