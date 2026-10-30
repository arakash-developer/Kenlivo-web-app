"use client";

import { useQuery } from "@tanstack/react-query";
import { collectionsApi } from "@/lib/api/collections";
import { queryKeys } from "@/lib/api/query-keys";

export function useCollections() {
  return useQuery({
    queryKey: queryKeys.collections.list,
    queryFn: collectionsApi.list,
    staleTime: 10 * 60_000,
  });
}
