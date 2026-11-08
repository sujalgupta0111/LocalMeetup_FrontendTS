import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { routePaths } from "@/routes/routepaths/routePaths";

export const configureApiClient = (
  apiClient: AxiosInstance
): AxiosInstance => {
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: unknown) => Promise.reject(error)
  );

  apiClient.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        localStorage.removeItem("token");
        window.location.href = routePaths.login;
      }

      return Promise.reject(error);
    }
  );

  return apiClient;
};