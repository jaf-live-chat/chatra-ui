import { useMemo } from "react";
import useSWR from "swr";

import {
  type CreatePaymentCheckoutPayload,
  type CreatePaymentCheckoutResponse,
  type Payment,
  type PaymentApiItem,
  type PaymentListResponse,
} from "../models/PaymentModel";
import { API_BASE_URL, SWR_OPTIONS } from "../constants/constants";
import axiosServices, { fetcher } from "../utils/axios";

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
  planName?: string;
  planPrice?: string;
  billingPeriod?: string;
  previousPlanName?: string;
  previousPlanPrice?: string;
  previousBillingPeriod?: string;
  newPlanFeatures?: string[];
  previousPlanFeatures?: string[];
  addedFeatures?: string[];
  removedFeatures?: string[];
  unchangedFeatures?: string[];
  integrationName?: string;
  welcomeName?: string;
};

const endpoints = {
  key: `${API_BASE_URL}/payments`,
};

const normalizePayment = (payment: PaymentApiItem): Payment => ({
  id: payment.id,
  tenantId: payment.tenantId,
  subscriptionId: payment.subscriptionId,
  tenantName: payment.tenantName || "-",
  subscriptionType: payment.subscriptionPlanName || "-",
  status: payment.status,
  amount: payment.amount,
  referenceNumber: payment.referenceNumber,
  transactionDate: payment.createdAt,
});

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

  getPayments: async (): Promise<Payment[]> => {
    const response = await axiosServices.get<PaymentListResponse>("/payments");
    const payments = Array.isArray(response.data?.payments) ? response.data.payments : [];
    return payments.map(normalizePayment);
  },
}

const useGetPayments = () => {
  const getPaymentsList = (url: string) =>
    fetcher<PaymentListResponse>(url, true) as Promise<PaymentListResponse>;

  const { data, isLoading, error, mutate } = useSWR<PaymentListResponse>(
    endpoints.key,
    getPaymentsList,
    SWR_OPTIONS,
  );

  const memoizedValue = useMemo(
    () => ({
      payments: Array.isArray(data?.payments) ? data.payments.map(normalizePayment) : [],
      count: data?.count ?? 0,
      isLoading,
      mutate,
      error,
    }),
    [data, isLoading, mutate, error],
  );

  return memoizedValue;
};

export default Payments;
export { normalizePayment, useGetPayments };