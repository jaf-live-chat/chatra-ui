import { useMemo } from "react";
import { APP_EMAIL, APP_LOGO, APP_NAME } from "../constants/constants";
import { useGetCompanyInfo } from "../services/companyInfoServices";

const useCompanyBranding = () => {
  const { companyInfo, isLoading } = useGetCompanyInfo();

  const branding = useMemo(() => {
    const companyName = companyInfo?.generalInformation?.companyName?.trim() || APP_NAME;
    const companyLogo = companyInfo?.companyLogo?.url?.trim() || "";
    const brandLogos = companyInfo?.brandLogos;
    const companyWebsite = companyInfo?.generalInformation?.website?.trim() || "";
    const companyEmail = companyInfo?.generalInformation?.contactEmail?.trim() || APP_EMAIL;
    const companyPhone = companyInfo?.generalInformation?.phoneNumber?.trim() || "";

    return {
      isLoading,
      companyInfo,
      companyName,
      companyLogo,
      companyWebsite,
      companyEmail,
      companyPhone,
      logos: {
        light: brandLogos?.light?.url?.trim() || companyLogo || APP_LOGO.logoLight,
        dark: brandLogos?.dark?.url?.trim() || companyLogo || APP_LOGO.logoDark,
        collapsed: brandLogos?.collapsed?.url?.trim() || companyLogo || APP_LOGO.logoMain,
        main: brandLogos?.collapsed?.url?.trim() || companyLogo || APP_LOGO.logoMain,
      },
    };
  }, [companyInfo, isLoading]);

  return branding;
};

export default useCompanyBranding;
