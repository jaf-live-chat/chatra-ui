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

type UploadSingleFn = (file: File) => Promise<UploadSingleResponse>;
type UploadMultipleFn = (files: File[]) => Promise<UploadMultipleResponse>;

export type {
  UploadedFileAsset,
  UploadSingleResponse,
  UploadMultipleResponse,
  UploadSingleFn,
  UploadMultipleFn,
};
