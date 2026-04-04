export type CreatePaymentCheckoutPayload = {
  subscriptionData: {
    companyName: string;
    companyCode: string;
    subscriptionPlanId: string;
    subscriptionStart: string;
  };
  agentData: {
    fullName: string;
    emailAddress: string;
    password: string;
    role?: string;
    phoneNumber?: string;
  };
};

export type CreatePaymentCheckoutResponse = {
  success: boolean;
  message: string;
  paymentReference?: string;
  reference?: string;
  referenceNumber?: string;
  checkoutUrl?: string;
  amount?: number;
  planName?: string;
  isHitpayBypassed?: boolean;
  tenant?: string;
  tenantId?: string;
  subscription?: string;
  subscriptionId?: string;
  tenantEmail?: string;
  companyName?: string;
};

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface PaymentApiItem {
  id: string;
  tenantId?: string;
  subscriptionId?: string;
  tenantName?: string;
  subscriptionPlanName?: string;
  status: PaymentStatus;
  amount?: number;
  referenceNumber?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  tenantId?: string;
  subscriptionId?: string;
  tenantName: string;
  subscriptionType: string;
  status: PaymentStatus;
  amount?: number;
  referenceNumber?: string;
  transactionDate: string;
}

export interface PaymentListResponse {
  success: boolean;
  count: number;
  payments: PaymentApiItem[];
}