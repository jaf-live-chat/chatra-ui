export type TenantStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

export interface Tenant {
  id: string;
  name: string;
  companyCode?: string;
  databaseName?: string;
  subscription: {
    id?: string;
    planName: string;
    startDate: string;
    endDate: string;
    status: TenantStatus;
  };
}
