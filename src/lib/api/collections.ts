import { api } from "./axios";
import type { ApiEnvelope, Collection } from "./types";

export const collectionsApi = {
  async list() {
    const { data } = await api.get<ApiEnvelope<Collection[]>>("/collections", {
      params: { limit: 100 },
    });
    return data.data;
  },
};
