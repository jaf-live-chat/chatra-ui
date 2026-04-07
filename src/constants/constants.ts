// ─── App Identity ────────────────────────────────────────────────────────────
const APP_NAME = `JAF Chatra`;
const APP_EMAIL = `support@jafchatra.com`;
const APP_LOGO = {
  logoMain:
    "https://res.cloudinary.com/dvrhry6ru/image/upload/v1773735919/logo1_f5e86y.png",
  logoLight:
    "https://res.cloudinary.com/dvrhry6ru/image/upload/v1774497953/JAF_white_pv1d5b.png",
  logoDark:
    "https://res.cloudinary.com/dvrhry6ru/image/upload/v1774497950/JAF_black_rg0udw.png",
};

const USER_ROLES = {
  MASTER_ADMIN: {
    label: "Master Admin",
    value: "MASTER_ADMIN",
  },
  ADMIN: {
    label: "Admin",
    value: "ADMIN",
  },
  SUPPORT_AGENT: {
    label: "Support Agent",
    value: "SUPPORT_AGENT",
  },
  VISITOR: {
    label: "Visitor",
    value: "VISITOR",
  },
};

const SWR_OPTIONS = {
  revalidateIfStale: true,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  onSuccess: (data: any, key: string, config: any) => data
};

type EnvironmentMode = "LOCAL" | "DEVELOPMENT" | "PRODUCTION";

const ENV = (import.meta as ImportMeta & {
  env: Record<string, string | undefined>;
}).env;

const getEnvironmentMode = (): EnvironmentMode => {
  const customMode = (ENV.VITE_MODE || "").toUpperCase();
  if (customMode === "LOCAL" || customMode === "DEVELOPMENT" || customMode === "PRODUCTION") {
    return customMode;
  }

  const viteMode = (ENV.MODE || "").toUpperCase();
  if (viteMode === "PRODUCTION") return "PRODUCTION";
  if (viteMode === "DEVELOPMENT") return "DEVELOPMENT";

  return "LOCAL";
};

const ENVIRONMENT_MODE = getEnvironmentMode();

const getAPIBaseURL = () => {
  switch (ENVIRONMENT_MODE) {
    case "PRODUCTION":
      return ENV.VITE_API_PROD_URL || ENV.VITE_API_URL_LOCAL;
    case "DEVELOPMENT":
      return ENV.VITE_API_DEVELOPMENT_URL || ENV.VITE_API_URL_LOCAL;
    case "LOCAL":
    default:
      return ENV.VITE_API_URL_LOCAL;
  }
};

const API_BASE_URL = getAPIBaseURL();

export {
  APP_NAME,
  APP_EMAIL,
  APP_LOGO,
  USER_ROLES,
  SWR_OPTIONS,
  API_BASE_URL
}