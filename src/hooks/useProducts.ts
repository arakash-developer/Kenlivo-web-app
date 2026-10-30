"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, productsApi, type CategoryInput, type CategoryListQuery, type ProductInput } from "@/lib/api/products";
import { queryKeys } from "@/lib/api/query-keys";
import type { ProductListQuery } from "@/lib/api/types";

export function useProducts(query: ProductListQuery = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: () => productsApi.list(query),
    enabled,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCategories(query: CategoryListQuery = {}) {
  return useQuery({
    queryKey: [...queryKeys.categories.list, query],
    queryFn: () => categoriesApi.list(query),
    staleTime: 10 * 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryInput) => categoriesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CategoryInput> }) =>
      categoriesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductInput) => productsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products.all }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductInput> }) =>
      productsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products.all }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products.all }),
  });
}
