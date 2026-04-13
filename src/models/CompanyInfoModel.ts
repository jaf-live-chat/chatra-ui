export type CompanyLogoAsset = {
  url: string;
  publicId: string;
};

export type CompanyBrandLogoMap = {
  light: CompanyLogoAsset;
  dark: CompanyLogoAsset;
  collapsed: CompanyLogoAsset;
};

export type CompanyGeneralInformation = {
  companyName: string;
  website: string;
  contactEmail: string;
  phoneNumber: string;
};

export type CompanyInfoRecord = {
  _id?: string;
  companyLogo: CompanyLogoAsset;
  brandLogos?: CompanyBrandLogoMap;
  generalInformation: CompanyGeneralInformation;
  createdAt?: string;
  updatedAt?: string;
};

export type CompanyInfoApiResponse = {
  success: boolean;
  message: string;
  companyInfo: CompanyInfoRecord;
};

export type UpdateCompanyInfoPayload = {
  generalInformation?: Partial<CompanyGeneralInformation>;
};

export type CompanyInfoFormData = {
  name: string;
  website: string;
  email: string;
  phone: string;
  logoUrl: string;
};
