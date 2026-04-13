import { useMemo } from "react";
import { APP_EMAIL, APP_LOGO, APP_NAME } from "../constants/constants";
import { useGetCompanyInfo } from "../services/companyInfoServices";

const DEFAULT_SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/jafdigital/",
  instagram: "https://www.instagram.com/jafdigitalofficial/",
  website: "https://jafdigital.co/",
};

const useCompanyBranding = () => {
  const { companyInfo, isLoading } = useGetCompanyInfo();

  const branding = useMemo(() => {
    const companyName = companyInfo?.generalInformation?.companyName?.trim() || APP_NAME;
    const companyLogo = companyInfo?.companyLogo?.url?.trim() || "";
    const brandLogos = companyInfo?.brandLogos;
    const socialLinks = companyInfo?.generalInformation?.socialLinks;
    const companyWebsite = socialLinks?.website?.trim() || DEFAULT_SOCIAL_LINKS.website;
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
      companySocialLinks: {
        facebook: socialLinks?.facebook?.trim() || DEFAULT_SOCIAL_LINKS.facebook,
        instagram: socialLinks?.instagram?.trim() || DEFAULT_SOCIAL_LINKS.instagram,
        website: companyWebsite,
      },
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
