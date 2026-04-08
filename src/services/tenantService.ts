import { useMemo } from "react";
import useSWR from "swr";
import axiosServices from "../utils/axios";
import { API_BASE_URL, SWR_OPTIONS } from "../constants/constants";
import { fetcher } from "../utils/axios";
import type { Tenant, TenantStatus } from "../models/TenantModel";

interface TenantApiSubscription {
  id?: string;
  planId?: string;
  planName?: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
}

interface TenantApiItem {
  id?: string;
  name?: string;
  companyCode?: string;
  databaseName?: string;
  owner?: {
    name?: string;
    email?: string;
  } | null;
  subscription?: TenantApiSubscription;
  upcomingSubscription?: TenantApiSubscription | null;
}

interface TenantListResponse {
  success: boolean;
  count: number;
  tenants: TenantApiItem[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

interface SingleTenantHookResponse {
  tenant: Tenant | null;
  isLoading: boolean;
  error: unknown;
  mutate: () => Promise<SingleTenantResponse | undefined>;
}

interface SingleTenantResponse {
  success: boolean;
  tenant: TenantApiItem;
}

interface TenantUpdateResponse {
  success: boolean;
  message: string;
  tenant: TenantApiItem;
}

type ManageSubscriptionAction = "DEACTIVATE" | "ADJUST_END_DATE" | "SET_END_DATE" | "CHANGE_PLAN";

interface ManageTenantSubscriptionPayload {
  action: ManageSubscriptionAction;
  days?: number;
  endDate?: string;
  subscriptionPlanId?: string;
}

interface TenantSubscriptionReminderResult {
  tenantId: string;
  companyName: string;
  subscriptionId: string;
  remainingDays: number;
  status: string;
  reason: string | null;
}

interface TenantSubscriptionReminderResponse {
  success: boolean;
  message: string;
  result: TenantSubscriptionReminderResult;
}

const endpoints = {
  key: `${API_BASE_URL}/tenants`,
};

const STATUS_PRIORITY: Record<TenantStatus, number> = {
  ACTIVE: 1,
  DEACTIVATED: 2,
  INACTIVE: 3,
  EXPIRED: 4,
};

const toTenantStatus = (status?: string, subscriptionEnd?: string | null): TenantStatus => {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "ACTIVE") return "ACTIVE";
  if (normalizedStatus === "DEACTIVATED") return "DEACTIVATED";
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
  const upcomingSubscription = tenant.upcomingSubscription || null;

  return {
    id: tenant.id || "",
    name: tenant.name || "-",
    companyCode: tenant.companyCode || "-",
    databaseName: tenant.databaseName || "-",
    owner: tenant.owner
      ? {
        name: tenant.owner.name || "-",
        email: tenant.owner.email || "-",
      }
      : null,
    subscription: {
      id: tenant.subscription?.id || "",
      planId: tenant.subscription?.planId || "",
      planName: tenant.subscription?.planName || "-",
      startDate: subscriptionStart,
      endDate: subscriptionEnd,
      status: toTenantStatus(tenant.subscription?.status, subscriptionEnd),
    },
    upcomingSubscription: upcomingSubscription
      ? {
        id: upcomingSubscription.id || "",
        planId: upcomingSubscription.planId || "",
        planName: upcomingSubscription.planName || "-",
        startDate: upcomingSubscription.startDate || "",
        endDate: upcomingSubscription.endDate || "",
        status: String(upcomingSubscription.status || "SCHEDULED").toUpperCase(),
      }
      : null,
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

  const response = await axiosServices.get<SingleTenantResponse>(`/tenants/${tenantId}`);

  if (!response.data?.tenant) {
    return null;
  }

  return normalizeTenant(response.data.tenant);
};

const useGetTenants = (page = 1, limit = 10) => {
  const getTenantList = (url: string) =>
    fetcher<TenantListResponse>(url, true) as Promise<TenantListResponse>;

  const paginationParams = new URLSearchParams({ page: String(page), limit: String(limit) });
  const urlWithPagination = `${endpoints.key}?${paginationParams.toString()}`;

  const { data, isLoading, error, mutate } = useSWR<TenantListResponse>(
    urlWithPagination,
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
      pagination: data?.pagination,
    }),
    [data, isLoading, mutate, error],
  );

  return memoizedValue;
};

const useGetSingleTenant = (tenantId?: string): SingleTenantHookResponse => {
  const shouldFetch = Boolean(tenantId);
  const requestUrl = shouldFetch ? `${endpoints.key}/${encodeURIComponent(tenantId || "")}` : null;

  const getTenant = (url: string) =>
    fetcher<SingleTenantResponse>(url, true) as Promise<SingleTenantResponse>;

  const { data, isLoading, error, mutate } = useSWR<SingleTenantResponse>(
    requestUrl,
    getTenant,
    SWR_OPTIONS,
  );

  const tenant = useMemo(() => {
    if (!data?.tenant) {
      return null;
    }

    return normalizeTenant(data.tenant);
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

const manageTenantSubscription = async (
  id: string,
  payload: ManageTenantSubscriptionPayload,
): Promise<Tenant> => {
  const response = await axiosServices.patch<TenantUpdateResponse>(`/tenants/${id}/subscription`, payload);
  return normalizeTenant(response.data.tenant);
};

const sendSubscriptionReminder = async (id: string): Promise<TenantSubscriptionReminderResponse> => {
  const response = await axiosServices.post<TenantSubscriptionReminderResponse>(
    `/subscriptions/notification-reminders/${id}`,
  );

  return response.data;
};

const tenantService = {
  getTenants,
  getSingleTenant,
  useGetTenants,
  useGetSingleTenant,
  updateTenantStatus,
  manageTenantSubscription,
  sendSubscriptionReminder,
  deleteTenant,
};

export {
  getTenants,
  getSingleTenant,
  useGetTenants,
  useGetSingleTenant,
  updateTenantStatus,
  manageTenantSubscription,
  sendSubscriptionReminder,
  deleteTenant,
};
export default tenantService;
