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
  checkoutUrl?: string;
  amount?: number;
  planName?: string;
  isHitpayBypassed?: boolean;
};