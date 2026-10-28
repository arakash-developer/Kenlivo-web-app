import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { tokenStore } from "./token-store";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

/** Shared axios instance for the Kenlivo API. */
export const api = axios.create({
  baseURL,
  withCredentials: true, // send/receive the httpOnly refresh cookie
  headers: { "Content-Type": "application/json" },
});

// Attach the access token to every request.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

// ---- Transparent refresh on 401 ----
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post<{ data: { accessToken: string } }>(
      `${baseURL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const token = data.data.accessToken;
    tokenStore.set(token);
    return token;
  } catch {
    tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const isAuthRoute = original?.url?.includes("/auth/");

    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      refreshing = refreshing ?? refreshAccessToken();
      const token = await refreshing;
      refreshing = null;
      if (token) {
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

/** Normalizes an axios error into a human-readable message. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    // Guard against HTML error pages returned when the server is down.
    if (typeof data === "object" && data !== null) {
      return (data as { message?: string }).message ?? error.message ?? fallback;
    }
    if (error.response?.status === 503 || error.response?.status === 502) {
      return "Server is temporarily unavailable. Please try again shortly.";
    }
    return error.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
