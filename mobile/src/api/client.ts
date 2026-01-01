import axios from "axios";
import { CONFIG } from "../constants/config";
import { getToken } from "../auth/token";

export const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
