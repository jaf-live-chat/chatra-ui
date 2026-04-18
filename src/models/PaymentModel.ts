export type CreatePaymentCheckoutPayload = {
  subscriptionData: {
    companyName: string;
    companyCode: string;
    subscriptionPlanId: string;
    subscriptionStart?: string;
    tenantId?: string;
    currentSubscriptionId?: string;
  };
  agentData?: {
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
  subscriptionChange?: boolean;
  tenant?: string;
  tenantId?: string;
  subscription?: string;
  subscriptionId?: string;
  tenantEmail?: string;
  companyName?: string;
};

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

export type CheckoutWorkflowStage =
  | "INITIATED"
  | "PAYMENT_PENDING"
  | "PROVISIONING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type CheckoutFailureReason =
  | "PAYMENT_FAILED"
  | "PAYMENT_DECLINED"
  | "PAYMENT_EXPIRED"
  | "PAYMENT_CANCELLED"
  | "PROVISIONING_TIMEOUT"
  | "PROVISIONING_FAILED"
  | "UNKNOWN";

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