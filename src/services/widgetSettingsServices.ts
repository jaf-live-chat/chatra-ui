import { API_BASE_URL } from "../constants/constants";
import type { WidgetSettingsRecord } from "../models/LiveChatModel";
import axiosServices from "../utils/axios";

export interface GetWidgetSettingsResponse {
  success: boolean;
  widgetSettings: WidgetSettingsRecord;
}

export interface UpdateWidgetSettingsPayload {
  widgetTitle?: string;
  welcomeMessage?: string;
  accentColor?: string;
  widgetLogo?: string;
  widgetLogoFile?: File | null;
}

export interface UpdateWidgetSettingsResponse {
  success: boolean;
  message: string;
  widgetSettings: WidgetSettingsRecord;
}

const endpoints = {
  widgetSettings: `${API_BASE_URL}/widget-settings`,
};

const widgetSettingsServices = {
  getWidgetSettings: async (): Promise<GetWidgetSettingsResponse> => {
    const response = await axiosServices.get(endpoints.widgetSettings);
    return response.data;
  },

  updateWidgetSettings: async (
    payload: UpdateWidgetSettingsPayload,
  ): Promise<UpdateWidgetSettingsResponse> => {
    const hasLogoFile = payload.widgetLogoFile instanceof File;

    if (hasLogoFile) {
      const formData = new FormData();
      const widgetLogoFile = payload.widgetLogoFile;

      if (payload.widgetTitle !== undefined) {
        formData.append("widgetTitle", payload.widgetTitle);
      }

      if (payload.welcomeMessage !== undefined) {
        formData.append("welcomeMessage", payload.welcomeMessage);
      }

      if (payload.accentColor !== undefined) {
        formData.append("accentColor", payload.accentColor);
      }

      if (payload.widgetLogo !== undefined) {
        formData.append("widgetLogo", payload.widgetLogo);
      }

      if (widgetLogoFile) {
        formData.append("widgetLogoFile", widgetLogoFile, widgetLogoFile.name);
      }

      const response = await axiosServices.patch(endpoints.widgetSettings, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    }

    const response = await axiosServices.patch(endpoints.widgetSettings, payload);
    return response.data;
  },
};

export default widgetSettingsServices;
