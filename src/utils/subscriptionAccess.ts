import { API_BASE_URL } from "../constants/constants";
import type { AuthTenant } from "../models/AgentModel";

const AUTH_STORAGE_KEY = "jaf_auth_session";

const ACTIVE_SUBSCRIPTION_STATUS = "ACTIVATED";
const ACTIVE_SUBSCRIPTION_STATUS_ALIASES = new Set(["ACTIVATED", "ACTIVE"]);
const SUBSCRIPTION_INACTIVE_CODE = "SUBSCRIPTION_INACTIVE";

const API_BASE_URL_ROOT = String(API_BASE_URL || "")
  .trim()
  .replace(/\/$/, "")
  .replace(/^https?:\/\/[^/]+/i, "");

type InactiveAllowedRule = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  pattern: RegExp;
};

const INACTIVE_ALLOWED_API_RULES: InactiveAllowedRule[] = [
  // History-only access
  { method: "GET", pattern: /^\/conversations\/history(?:\/|$)/ },
  { method: "GET", pattern: /^\/messages\/[^/]+(?:\/|$)/ },
  { method: "GET", pattern: /^\/visitors(?:\/[^/]+)?(?:\/|$)/ },
  { method: "GET", pattern: /^\/widget\/live-chat\/conversations\/history(?:\/|$)/ },
  { method: "GET", pattern: /^\/widget\/live-chat\/messages\/[^/]+(?:\/|$)/ },
  { method: "GET", pattern: /^\/widget\/live-chat\/visitor-profile(?:\/|$)/ },

  // Subscription recovery and billing management
  { method: "GET", pattern: /^\/agents\/me(?:\/|$)/ },
  { method: "GET", pattern: /^\/tenants\/[^/]+(?:\/|$)/ },
  { method: "GET", pattern: /^\/subscription-plans(?:\/[^/]+)?(?:\/|$)/ },
  { method: "GET", pattern: /^\/payments\/status(?:\/|$)/ },
  { method: "PATCH", pattern: /^\/tenants\/[^/]+\/subscription(?:\/cancel)?(?:\/|$)/ },
  { method: "POST", pattern: /^\/payments\/checkout(?:\/|$)/ },
  { method: "POST", pattern: /^\/subscriptions\/notification-reminders\/[^/]+(?:\/|$)/ },
];

export const SUBSCRIPTION_STATE_CHANGED_EVENT = "jaf_subscription_state_changed";

export type SubscriptionAccessState = {
  isActive: boolean;
  status: string;
  reason: string;
  endDate: string | null;
};

const parseAsLocalCalendarDate = (value: string | Date | null | undefined) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const rawValue = String(value).trim();
  if (!rawValue) {
    return null;
  }

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(rawValue);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const monthIndex = Number(dateOnlyMatch[2]) - 1;
    const day = Number(dateOnlyMatch[3]);
    return new Date(year, monthIndex, day);
  }

  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const resolveSubscriptionDates = (tenant: AuthTenant | null | undefined) => {
  const subscription = tenant?.subscription;
  const subscriptionData = tenant?.subscriptionData;

  return {
    startDate: subscriptionData?.startDate || subscription?.startDate || null,
    endDate: subscriptionData?.endDate || subscription?.endDate || null,
  };
};

const resolveSubscriptionStatus = (tenant: AuthTenant | null | undefined) => {
  const rawStatus = tenant?.subscriptionData?.status;
  return String(rawStatus || ACTIVE_SUBSCRIPTION_STATUS).toUpperCase();
};

export const getSubscriptionAccessState = (tenant: AuthTenant | null | undefined): SubscriptionAccessState => {
  const { startDate, endDate } = resolveSubscriptionDates(tenant);
  const status = resolveSubscriptionStatus(tenant);
  const today = parseAsLocalCalendarDate(new Date());
  const parsedStartDate = parseAsLocalCalendarDate(startDate);
  const parsedEndDate = parseAsLocalCalendarDate(endDate);

  if (!ACTIVE_SUBSCRIPTION_STATUS_ALIASES.has(status)) {
    return {
      isActive: false,
      status,
      reason: "Your subscription is inactive.",
      endDate: endDate ? String(endDate) : null,
    };
  }

  if (parsedStartDate && today && parsedStartDate.getTime() > today.getTime()) {
    return {
      isActive: false,
      status,
      reason: "Your subscription has not started yet.",
      endDate: endDate ? String(endDate) : null,
    };
  }

  if (parsedEndDate && today && parsedEndDate.getTime() < today.getTime()) {
    return {
      isActive: false,
      status: "EXPIRED",
      reason: "Your subscription has expired.",
      endDate: endDate ? String(endDate) : null,
    };
  }

  return {
    isActive: true,
    status,
    reason: "",
    endDate: endDate ? String(endDate) : null,
  };
};

const stripApiPrefix = (path: string) => {
  const withoutDomain = path.replace(/^https?:\/\/[^/]+/i, "");
  const withoutQuery = withoutDomain.split("?")[0] || "";
  const normalized = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;

  if (API_BASE_URL_ROOT && normalized.startsWith(API_BASE_URL_ROOT)) {
    return normalized.slice(API_BASE_URL_ROOT.length) || "/";
  }

  return normalized.replace(/^\/api\/v\d+/, "") || "/";
};

export const isInactiveAllowedApiRequest = (method: string | undefined, url: string | undefined) => {
  const normalizedMethod = String(method || "GET").toUpperCase();
  const normalizedPath = stripApiPrefix(String(url || ""));
  return INACTIVE_ALLOWED_API_RULES.some((rule) => {
    return rule.method === normalizedMethod && rule.pattern.test(normalizedPath);
  });
};

export const isInactiveSubscriptionError = (errorLike: unknown) => {
  const errorRecord = errorLike as {
    response?: { status?: number; data?: { code?: string; message?: string } };
  };

  const status = Number(errorRecord?.response?.status || 0);
  const code = String(errorRecord?.response?.data?.code || "").toUpperCase();
  const message = String(errorRecord?.response?.data?.message || "").toLowerCase();

  if (code === SUBSCRIPTION_INACTIVE_CODE) {
    return true;
  }

  return status === 403 && message.includes("subscription") && message.includes("inactive");
};

export const readStoredSubscriptionAccess = (): SubscriptionAccessState | null => {
  try {
    const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) {
      return null;
    }

    const parsedSession = JSON.parse(rawSession) as { tenant?: AuthTenant | null };
    return getSubscriptionAccessState(parsedSession?.tenant || null);
  } catch {
    return null;
  }
};
