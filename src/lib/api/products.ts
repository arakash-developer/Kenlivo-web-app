import { api } from "./axios";
import type { ApiEnvelope, Category, Product, ProductListQuery } from "./types";

export interface ProductInput {
  name: string;
  description: string;
  tagline?: string;
  price: number;
  discountPercentage?: number;
  category: string;
  collection: string;
  images?: string[];
  stock?: number;
  isActive?: boolean;
}

export const productsApi = {
  async list(query: ProductListQuery = {}) {
    const { data } = await api.get<ApiEnvelope<Product[]>>("/products", { params: query });
    return { items: data.data, meta: data.meta };
  },

  async getById(id: string) {
    const { data } = await api.get<ApiEnvelope<Product>>(`/products/${id}`);
    return data.data;
  },

  async create(payload: ProductInput) {
    const { data } = await api.post<ApiEnvelope<Product>>("/products", payload);
    return data.data;
  },

  async update(id: string, payload: Partial<ProductInput>) {
    const { data } = await api.patch<ApiEnvelope<Product>>(`/products/${id}`, payload);
    return data.data;
  },

  async remove(id: string) {
    await api.delete(`/products/${id}`);
  },
};

export interface CategoryInput {
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

export interface CategoryListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const categoriesApi = {
  async list(query: CategoryListQuery = {}) {
    const { data } = await api.get<ApiEnvelope<Category[]>>("/categories", {
      params: query.page ? query : { limit: 100, ...query },
    });
    return { items: data.data, meta: data.meta };
  },

  async create(payload: CategoryInput) {
    const { data } = await api.post<ApiEnvelope<Category>>("/categories", payload);
    return data.data;
  },

  async update(id: string, payload: Partial<CategoryInput>) {
    const { data } = await api.patch<ApiEnvelope<Category>>(`/categories/${id}`, payload);
    return data.data;
  },

  async remove(id: string) {
    await api.delete(`/categories/${id}`);
  },
};
