/// <reference types="vite/client" />

import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { beginMutationBlock, endMutationBlock } from '../services/apiClient';

const PROJECT_API = import.meta.env.VITE_APP_API_URL_LOCAL

const axiosServices = axios.create({
  baseURL: PROJECT_API,
  headers: { 'ngrok-skip-browser-warning': 'true' }
});

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

type BlockingRequestConfig = InternalAxiosRequestConfig & {
  loadingMessage?: string;
  skipGlobalBlocking?: boolean;
  _didAcquireGlobalBlock?: boolean;
};

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    const blockingConfig = config as BlockingRequestConfig;
    const method = String(config.method || 'GET').toUpperCase();

    if (MUTATION_METHODS.has(method) && !blockingConfig.skipGlobalBlocking) {
      const acquired = beginMutationBlock(blockingConfig.loadingMessage);

      if (!acquired) {
        return Promise.reject(new axios.CanceledError('Blocked while another request is being processed.'));
      }

      blockingConfig._didAcquireGlobalBlock = true;
    }

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

axiosServices.interceptors.response.use(
  (response) => {
    const blockingConfig = response.config as BlockingRequestConfig;

    if (blockingConfig._didAcquireGlobalBlock) {
      endMutationBlock();
    }

    return response;
  },
  (error) => {
    const blockingConfig = error?.config as BlockingRequestConfig | undefined;

    if (blockingConfig?._didAcquireGlobalBlock) {
      endMutationBlock();
    }

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
