/// <reference types="vite/client" />

import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const PROJECT_API = import.meta.env.VITE_APP_API_URL_LOCAL

const axiosServices = axios.create({
  baseURL: PROJECT_API,
  headers: { 'ngrok-skip-browser-warning': 'true' }
});

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('serviceToken');
    const headers = axios.AxiosHeaders.from(config.headers);

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    headers.set('ngrok-skip-browser-warning', 'true');
    config.headers = headers;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosServices;

type FetcherArgs = string | [string, AxiosRequestConfig];

export const fetcher = async <T = unknown>(
  args: FetcherArgs,
  isValid?: boolean,
  cancelToken?: AxiosRequestConfig
): Promise<T | undefined> => {
  /** Skip the request if isValid is specifically to false */
  if (isValid === false) {
    return;
  }

  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get<T>(url, { ...config, ...cancelToken });

  return res.data;
};

export const fetcherPost = async <T = unknown>(args: FetcherArgs): Promise<T> => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.post<T>(url, { ...config });

  return res.data;
};
