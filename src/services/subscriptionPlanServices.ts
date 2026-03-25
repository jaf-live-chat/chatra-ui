import { useMemo } from "react";
import axiosServices, { fetcher } from "../utils/axios";
import useSWR from "swr";
import { API_BASE_URL, SWR_OPTIONS } from "../constants/constants";

export interface SubscriptionPlanApiModel {
  _id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  limits?: {
    maxAgents?: number;
    maxWebsites?: number;
  };
  features: string[];
  isMostPopular: boolean;
  isPosted: boolean;
}

interface SubscriptionPlanListResponse {
  success: boolean;
  count: number;
  plans: SubscriptionPlanApiModel[];
}

type SubscriptionPlanPayload = {
  name: string;
  description: string;
  price: number;
  billingCycle: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  limits: {
    maxAgents: number;
    maxWebsites: number;
  };
  features: string[];
  isMostPopular: boolean;
  isPosted: boolean;
};

const endpoints = {
  key: `${API_BASE_URL}/subscription-plans`,
};

const isInternalFreePlan = (plan: SubscriptionPlanApiModel) => {
  const normalizedName = String(plan.name || "").toLowerCase();
  return normalizedName.includes("internal") && plan.price === 0;
};

export const createSubscriptionPlan = async (payload: SubscriptionPlanPayload) => {
  try {
    const response = await axiosServices.post("/subscription-plans", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    throw error;
  }
};

export const updateSubscriptionPlanById = async (planId: string, payload: SubscriptionPlanPayload) => {
  try {
    const response = await axiosServices.put(`/subscription-plans/${planId}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    throw error;
  }
};

export const deleteSubscriptionPlanById = async (planId: string) => {
  try {
    const response = await axiosServices.delete(`/subscription-plans/${planId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting subscription plan:", error);
    throw error;
  }
};

export const useGetSubscriptionPlans = () => {
  const getSubscriptionPlans = (url: string) =>
    fetcher<SubscriptionPlanListResponse>(url, true) as Promise<SubscriptionPlanListResponse>;

  const { data, isLoading, error, mutate } = useSWR<SubscriptionPlanListResponse>(
    endpoints.key,
    getSubscriptionPlans,
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      data,
      plans: (data?.plans ?? []).filter((plan) => !isInternalFreePlan(plan)),
      count: (data?.plans ?? []).filter((plan) => !isInternalFreePlan(plan)).length,
      isLoading,
      mutate,
      error,
    }),
    [data, isLoading, mutate, error]
  );

  return memoizedValue;
};