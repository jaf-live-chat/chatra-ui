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

export type CompanyAddress = {
  streetAddress: string;
  city: string;
  stateProvince: string;
  zipPostalCode: string;
  country: string;
};

export type CompanyBusinessDetails = {
  industry: string;
  companySize: string;
  timezone: string;
  description: string;
};

export type CompanyInfoRecord = {
  _id?: string;
  companyLogo: CompanyLogoAsset;
  brandLogos?: CompanyBrandLogoMap;
  generalInformation: CompanyGeneralInformation;
  address: CompanyAddress;
  businessDetails: CompanyBusinessDetails;
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
  address?: Partial<CompanyAddress>;
  businessDetails?: Partial<CompanyBusinessDetails>;
};

export type CompanyInfoFormData = {
  name: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  industry: string;
  size: string;
  description: string;
  timezone: string;
  logoUrl: string;
};
