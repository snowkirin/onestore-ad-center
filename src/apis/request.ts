import axios from 'axios';
import { getMolocoToken } from '@apis/auth.api';

const ENV = import.meta.env;

export const WISEBIRDS_API = ENV.VITE_PROXY === 'true' ? '/WB_API' : ENV.VITE_WISEBIRDS_API;
export const MOLOCO_ADS_API = ENV.VITE_PROXY === 'true' ? '/AD_API' : ENV.VITE_MOLOCO_ADS_API;
export const MOLOCO_CLOUD_API = ENV.VITE_PROXY === 'true' ? '/CD_API' : ENV.VITE_MOLOCO_CLOUD_API;

/*
 * Usage Common(Wisebirds) API Request
 * */
export const API_WB = axios.create({
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  baseURL: WISEBIRDS_API,
});

/*
 * Only Moloco API Request
 * */
export const API_CLOUD = axios.create({
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  baseURL: MOLOCO_CLOUD_API,
});

export const API_ADS = axios.create({
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  baseURL: MOLOCO_ADS_API,
});

export const API_GRAPHQL = axios.create({
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  baseURL: 'https://mcp-appbase-prod-rp76syjtkq-uc.a.run.app/graphql',
});

API_CLOUD.interceptors.request.use(async (config) => {
  const result = await getMolocoToken();
  const { token } = result.data;
  config.headers!.Authorization = `Bearer ${token}`;
  return config;
});
API_ADS.interceptors.request.use(async (config) => {
  const result = await getMolocoToken();
  const { token } = result.data;
  config.headers!.Authorization = `Bearer ${token}`;
  return config;
});

API_WB.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response.status === 401) {
      document.location.href = '/';
    } else if (error.response.status === 429) {
      //too many request, moloco axios 에도 적용 필요
      document.location.href = '/';
    } else {
      return Promise.reject(error);
    }
  }
);

API_GRAPHQL.interceptors.request.use(async (config) => {
  const result = await getMolocoToken();
  const { token } = result.data;
  config.headers!.Authorization = `Bearer ${token}`;
  return config;
});
