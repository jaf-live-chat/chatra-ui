// ─── App Identity ────────────────────────────────────────────────────────────
const APP_NAME = `JAF Chatra`;
const APP_EMAIL = `support@jafchatra.com`;
const APP_LOGO = {
  logoMain:
    "https://res.cloudinary.com/dvrhry6ru/image/upload/v1773735919/logo1_f5e86y.png",
  logoLight:
    "https://res.cloudinary.com/dvrhry6ru/image/upload/v1773735919/logo2_pbybze.png",
  logoDark:
    "https://res.cloudinary.com/dvrhry6ru/image/upload/v1773735919/logo3_a0x3s4.png",
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


export {
  APP_NAME,
  APP_EMAIL,
  APP_LOGO,
  USER_ROLES,
}