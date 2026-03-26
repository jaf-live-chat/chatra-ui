import { useMemo } from "react";
import useSWR from "swr";
import axiosServices from "../utils/axios";
import { API_BASE_URL, SWR_OPTIONS } from "../constants/constants";
import { fetcher } from "../utils/axios";
import type { Tenant, TenantStatus } from "../models/TenantModel";

interface TenantApiSubscription {
  planName?: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
}

interface TenantApiItem {
  id?: string;
  name?: string;
  subscription?: TenantApiSubscription;
}

interface TenantListResponse {
  success: boolean;
  count: number;
  tenants: TenantApiItem[];
}

interface SingleTenantHookResponse {
  tenant: Tenant | null;
  isLoading: boolean;
  error: unknown;
  mutate: () => Promise<TenantListResponse | undefined>;
}

interface TenantUpdateResponse {
  success: boolean;
  message: string;
  tenant: TenantApiItem;
}

const endpoints = {
  key: `${API_BASE_URL}/tenants`,
};

const STATUS_PRIORITY: Record<TenantStatus, number> = {
  ACTIVE: 1,
  INACTIVE: 2,
  EXPIRED: 3,
};

const toTenantStatus = (status?: string, subscriptionEnd?: string | null): TenantStatus => {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "ACTIVE") return "ACTIVE";
  if (normalizedStatus === "INACTIVE") return "INACTIVE";
  if (normalizedStatus === "EXPIRED") return "EXPIRED";

  if (subscriptionEnd) {
    const endDate = new Date(subscriptionEnd);
    if (!Number.isNaN(endDate.getTime()) && endDate.getTime() < Date.now()) {
      return "EXPIRED";
    }
  }

  return "INACTIVE";
};

const normalizeTenant = (tenant: TenantApiItem): Tenant => {
  const subscriptionStart = tenant.subscription?.startDate || "";
  const subscriptionEnd = tenant.subscription?.endDate || "";

  return {
    id: tenant.id || "",
    name: tenant.name || "-",
    subscription: {
      planName: tenant.subscription?.planName || "-",
      startDate: subscriptionStart,
      endDate: subscriptionEnd,
      status: toTenantStatus(tenant.subscription?.status, subscriptionEnd),
    },
  };
};

const mapAndSortTenants = (tenants: TenantApiItem[]): Tenant[] =>
  tenants
    .map(normalizeTenant)
    .sort((a, b) => {
      if (STATUS_PRIORITY[a.subscription.status] !== STATUS_PRIORITY[b.subscription.status]) {
        return STATUS_PRIORITY[a.subscription.status] - STATUS_PRIORITY[b.subscription.status];
      }

      return a.name.localeCompare(b.name);
    });

const getTenants = async (): Promise<Tenant[]> => {
  const response = await axiosServices.get<TenantListResponse>("/tenants");
  const tenants = Array.isArray(response.data?.tenants) ? response.data.tenants : [];

  return mapAndSortTenants(tenants);
};

const getSingleTenant = async (tenantId: string): Promise<Tenant | null> => {
  if (!tenantId) return null;

  const response = await axiosServices.get<TenantListResponse>("/tenants", {
    params: { _id: tenantId },
  });

  const tenants = Array.isArray(response.data?.tenants) ? response.data.tenants : [];
  if (tenants.length === 0) {
    return null;
  }

  return normalizeTenant(tenants[0]);
};

const useGetTenants = () => {
  const getTenantList = (url: string) =>
    fetcher<TenantListResponse>(url, true) as Promise<TenantListResponse>;

  const { data, isLoading, error, mutate } = useSWR<TenantListResponse>(
    endpoints.key,
    getTenantList,
    SWR_OPTIONS,
  );

  const memoizedValue = useMemo(
    () => ({
      data,
      tenants: mapAndSortTenants(Array.isArray(data?.tenants) ? data.tenants : []),
      count: Array.isArray(data?.tenants) ? data.tenants.length : 0,
      isLoading,
      mutate,
      error,
    }),
    [data, isLoading, mutate, error],
  );

  return memoizedValue;
};

const useGetSingleTenant = (tenantId?: string): SingleTenantHookResponse => {
  const shouldFetch = Boolean(tenantId);
  const requestUrl = shouldFetch ? `${endpoints.key}?_id=${encodeURIComponent(tenantId || "")}` : null;

  const getTenant = (url: string) =>
    fetcher<TenantListResponse>(url, true) as Promise<TenantListResponse>;

  const { data, isLoading, error, mutate } = useSWR<TenantListResponse>(
    requestUrl,
    getTenant,
    SWR_OPTIONS,
  );

  const tenant = useMemo(() => {
    if (!Array.isArray(data?.tenants) || data.tenants.length === 0) {
      return null;
    }

    return normalizeTenant(data.tenants[0]);
  }, [data]);

  return {
    tenant,
    isLoading,
    error,
    mutate,
  };
};

const updateTenantStatus = async (id: string, status: TenantStatus): Promise<Tenant> => {
  const response = await axiosServices.put<TenantUpdateResponse>(`/tenants/${id}/status`, {
    status,
  });

  return normalizeTenant(response.data.tenant);
};

const deleteTenant = async (id: string): Promise<void> => {
  await axiosServices.delete(`/tenants/${id}`);
};

const tenantService = {
  getTenants,
  getSingleTenant,
  useGetTenants,
  useGetSingleTenant,
  updateTenantStatus,
  deleteTenant,
};

export {
  getTenants,
  getSingleTenant,
  useGetTenants,
  useGetSingleTenant,
  updateTenantStatus,
  deleteTenant,
};
export default tenantService;
