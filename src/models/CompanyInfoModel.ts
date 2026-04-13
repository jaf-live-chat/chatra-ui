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
  contactEmail: string;
  phoneNumber: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    website: string;
  };
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
  email: string;
  phone: string;
  facebook: string;
  instagram: string;
  publicWebsite: string;
  logoUrl: string;
};
