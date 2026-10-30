import { api } from "./axios";
import type {
  ApiEnvelope,
  Order,
  OrderListQuery,
  OrderStatus,
  PaymentMethod,
  ShippingAddress,
} from "./types";

export type ShippingZone = "inside_kurigram" | "outside_kurigram";

export interface CreateOrderPayload {
  items: Array<{ product: string; quantity: number }>;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  shippingZone: ShippingZone;
}

export const ordersApi = {
  async create(payload: CreateOrderPayload) {
    const { data } = await api.post<
      ApiEnvelope<{ _id: string; isAuthenticated: boolean }>
    >("/orders", payload);
    return data.data;
  },

  async listAll(query: OrderListQuery = {}) {
    const { data } = await api.get<ApiEnvelope<Order[]>>("/orders", { params: query });
    return { items: data.data, meta: data.meta };
  },

  async listMine(query: OrderListQuery = {}) {
    const { data } = await api.get<ApiEnvelope<Order[]>>("/orders/me", { params: query });
    return { items: data.data, meta: data.meta };
  },

  async getById(id: string) {
    const { data } = await api.get<ApiEnvelope<Order>>(`/orders/${id}`);
    return data.data;
  },

  async updateStatus(id: string, status: OrderStatus) {
    const { data } = await api.patch<ApiEnvelope<Order>>(`/orders/${id}/status`, { status });
    return data.data;
  },

  async cancel(id: string) {
    const { data } = await api.patch<ApiEnvelope<Order>>(`/orders/${id}/cancel`);
    return data.data;
  },
};
