import axiosServices from "../utils/axios";

type UploadedFileAsset = {
  url: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  createdAt?: string;
};

type UploadSingleResponse = {
  success: boolean;
  message: string;
  file: UploadedFileAsset;
};

type UploadMultipleResponse = {
  success: boolean;
  message: string;
  files: UploadedFileAsset[];
};

const buildFormData = (fieldName: string, file: File) => {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
};

const uploadService = {
  uploadAvatar: async (file: File): Promise<UploadSingleResponse> => {
    const response = await axiosServices.put("/agents/profile", buildFormData("avatar", file), {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      success: response.data?.success,
      message: response.data?.message || "Avatar uploaded successfully.",
      file: {
        url: response.data?.agent?.profilePicture,
        publicId: response.data?.agent?.profilePicture || "avatar",
      },
    };
  },

  uploadSingle: async (file: File): Promise<UploadSingleResponse> => {
    const response = await axiosServices.post("/agents/upload/single", buildFormData("file", file), {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  uploadMultiple: async (files: File[]): Promise<UploadMultipleResponse> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await axiosServices.post("/agents/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },
};

export type { UploadedFileAsset, UploadSingleResponse, UploadMultipleResponse };
export default uploadService;
