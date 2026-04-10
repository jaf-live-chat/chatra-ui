import { useMemo } from "react";
import useSWR from "swr";
import { API_BASE_URL, SWR_OPTIONS } from "../constants/constants";
import axiosServices, { fetcher } from "../utils/axios";
import type {
  CompanyInfoApiResponse,
  UpdateCompanyInfoPayload,
} from "../models/CompanyInfoModel";

const endpoints = {
  key: `${API_BASE_URL}/company-info/public`,
};

export const useGetCompanyInfo = () => {
  const getCompanyInfo = (url: string) =>
    fetcher<CompanyInfoApiResponse>(url, true) as Promise<CompanyInfoApiResponse>;

  const { data, isLoading, error, mutate } = useSWR<CompanyInfoApiResponse>(
    endpoints.key,
    getCompanyInfo,
    SWR_OPTIONS
  );

  return useMemo(
    () => ({
      data,
      companyInfo: data?.companyInfo,
      isLoading,
      error,
      mutate,
    }),
    [data, isLoading, error, mutate]
  );
};

const companyInfoServices = {
  getCompanyInfo: async (): Promise<CompanyInfoApiResponse> => {
    const response = await axiosServices.get("/company-info");
    return response.data;
  },

  updateCompanyInfo: async (payload: UpdateCompanyInfoPayload): Promise<CompanyInfoApiResponse> => {
    const response = await axiosServices.patch("/company-info", payload);
    return response.data;
  },

  updateCompanyLogo: async (file: File, logoType: "light" | "dark" | "collapsed" | "main"): Promise<CompanyInfoApiResponse> => {
    const formData = new FormData();
    formData.append("logo", file);
    formData.append("logoType", logoType);

    const response = await axiosServices.patch("/company-info/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },
};

export default companyInfoServices;
