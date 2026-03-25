import { CreatePaymentCheckoutPayload, CreatePaymentCheckoutResponse } from "../models/PaymentModel";
import axiosServices from "../utils/axios";

type CheckoutStatusResponse = {
  success: boolean;
  status: string;
  isProvisioned: boolean;
  paymentReference?: string;
  paymentRequestId?: string;
  tenantId?: string;
  subscriptionId?: string;
  apiKey?: string;
  tenantEmail?: string;
  companyName?: string;
};

const Payments = {
  createCheckout: async (payload: CreatePaymentCheckoutPayload): Promise<CreatePaymentCheckoutResponse> => {
    try {
      const response = await axiosServices.post("/payments/checkout", payload);
      return response.data;
    } catch (error) {
      console.error("Error creating payment checkout:", error);
      throw error;
    }
  },

  getCheckoutStatus: async (params: {
    reference?: string;
    paymentRequestId?: string;
    tenantId?: string;
    subscriptionId?: string;
  }): Promise<CheckoutStatusResponse> => {
    const response = await axiosServices.get("/payments/status", { params });
    return response.data;
  },
}

export default Payments;