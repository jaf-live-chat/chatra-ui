export type TenantStatus = "ACTIVE" | "INACTIVE" | "EXPIRED" | "DEACTIVATED";

export interface Tenant {
  id: string;
  name: string;
  companyCode?: string;
  databaseName?: string;
  subscription: {
    id?: string;
    planId?: string;
    planName: string;
    startDate: string;
    endDate: string;
    status: TenantStatus;
  };
  upcomingSubscription?: {
    id?: string;
    planId?: string;
    planName: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
}
