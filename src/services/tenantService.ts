import axiosServices from "../utils/axios";
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

interface TenantUpdateResponse {
  success: boolean;
  message: string;
  tenant: TenantApiItem;
}

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

const getTenants = async (): Promise<Tenant[]> => {
  const response = await axiosServices.get<TenantListResponse>("/tenants");
  const tenants = Array.isArray(response.data?.tenants) ? response.data.tenants : [];

  return tenants
    .map(normalizeTenant)
    .sort((a, b) => {
      if (STATUS_PRIORITY[a.subscription.status] !== STATUS_PRIORITY[b.subscription.status]) {
        return STATUS_PRIORITY[a.subscription.status] - STATUS_PRIORITY[b.subscription.status];
      }

      return a.name.localeCompare(b.name);
    });
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
  updateTenantStatus,
  deleteTenant,
};

export { getTenants, updateTenantStatus, deleteTenant };
export default tenantService;
