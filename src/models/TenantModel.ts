export type TenantStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

export interface Tenant {
  id: string;
  name: string;
  subscription: {
    planName: string;
    startDate: string;
    endDate: string;
    status: TenantStatus;
  };
}
