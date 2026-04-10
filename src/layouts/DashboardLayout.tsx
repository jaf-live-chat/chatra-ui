import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronDown,
  LogOut,
  Settings2,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Avatar, Button, Chip, Stack, Tooltip, Typography } from "@mui/material";
import { DarkModeProvider, useDarkMode } from "../providers/DarkModeContext";
import { USER_ROLES, USER_STATUS } from "../constants/constants";
import useAuth from "../hooks/useAuth";
import useGetRole from "../hooks/useGetRole";
import useIsMobile from "../hooks/useMobile";
import Agents from "../services/agentServices";
import { MODULE_GROUPS } from "../constants/modules";
import filterModulesByRole from "../utils/filterModules";
import { formatDate } from "../utils/dateFormatter";
import type { AuthUser } from "../models/AgentModel";
import toTitleCase from "../utils/toTitleCase";
import getAvatarColor from "../utils/getAvatarColor";
import AutoLogoutModal from "../components/common/AutoLogoutModal";
import Logo from "../components/common/Logo";

const INACTIVITY_LIMIT_MS = 2 * 60 * 1000;
const AUTO_LOGOUT_WARNING_SECONDS = 30;

// ── Inner layout (consumes dark-mode context) ──────────────────────────────────

function DashboardLayoutInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPlanPopupOpen, setIsPlanPopupOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [timeTick, setTimeTick] = useState(() => Date.now());
  const [isAutoLogoutOpen, setIsAutoLogoutOpen] = useState(false);
  const [autoLogoutSecondsLeft, setAutoLogoutSecondsLeft] = useState(AUTO_LOGOUT_WARNING_SECONDS);
  const inactivityTimeoutRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTimeTick(Date.now());
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const { isDark, toggleDark } = useDarkMode();
  const { user, tenant, logout, updateUser } = useAuth();
  const { isAdmin } = useGetRole();

  const clearInactivityTimeout = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      window.clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
  }, []);

  const clearCountdownInterval = useCallback(() => {
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    clearInactivityTimeout();
    clearCountdownInterval();
    await logout();
    navigate("/login", { replace: true });
  }, [clearCountdownInterval, clearInactivityTimeout, logout, navigate]);

  const startInactivityTimer = useCallback(() => {
    clearInactivityTimeout();
    inactivityTimeoutRef.current = window.setTimeout(() => {
      setAutoLogoutSecondsLeft(AUTO_LOGOUT_WARNING_SECONDS);
      setIsAutoLogoutOpen(true);
    }, INACTIVITY_LIMIT_MS);
  }, [clearInactivityTimeout]);
  const roleFilteredGroups = filterModulesByRole(MODULE_GROUPS, user?.role);
  const sidebarGroups = roleFilteredGroups
    .map((group) => ({
      ...group,
      modules: filterModulesByRole(group.modules, user?.role),
    }))
    .filter((group) => group.modules.length > 0);

  const isActivePath = (path: string) => {
    const [targetPath, targetQuery] = path.split("?");

    if (location.pathname !== targetPath) {
      return false;
    }

    if (!targetQuery) {
      return true;
    }

    const currentSearch = new URLSearchParams(location.search);
    const expectedSearch = new URLSearchParams(targetQuery);

    for (const [key, value] of expectedSearch.entries()) {
      if (currentSearch.get(key) !== value) {
        return false;
      }
    }

    return true;
  };

  const handleModuleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      const response = await Agents.updateMyStatus(status);
      updateUser(response.agent);
    } finally {
      setIsStatusOpen(false);
    }
  };

  const handleStaySignedIn = useCallback(() => {
    setIsAutoLogoutOpen(false);
    setAutoLogoutSecondsLeft(AUTO_LOGOUT_WARNING_SECONDS);
    startInactivityTimer();
  }, [startInactivityTimer]);

  useEffect(() => {
    if (isAutoLogoutOpen) {
      clearCountdownInterval();
      countdownIntervalRef.current = window.setInterval(() => {
        setAutoLogoutSecondsLeft((prev) => {
          if (prev <= 1) {
            clearCountdownInterval();
            void handleLogout();
            return 0;
          }

          return prev - 1;
        });
      }, 1000);

      return () => {
        clearCountdownInterval();
      };
    }

    clearCountdownInterval();
    return undefined;
  }, [clearCountdownInterval, handleLogout, isAutoLogoutOpen]);

  useEffect(() => {
    if (isAutoLogoutOpen) {
      return;
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    const handleUserActivity = () => {
      startInactivityTimer();
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    startInactivityTimer();

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
      clearInactivityTimeout();
    };
  }, [clearInactivityTimeout, isAutoLogoutOpen, startInactivityTimer]);

  useEffect(() => {
    return () => {
      clearInactivityTimeout();
      clearCountdownInterval();
    };
  }, [clearCountdownInterval, clearInactivityTimeout]);

  const userInitial = user?.fullName?.slice(0, 2)?.toUpperCase() || "U";
  const userName = user?.fullName || "User";
  const userEmail = user?.emailAddress || "";
  const userProfilePicture = user?.profilePicture || "";
  const [profileImageFailed, setProfileImageFailed] = useState(false);
  const companyName = tenant?.companyName || "-";
  const userRole = user?.role || USER_ROLES.VISITOR.value;
  const subscription = tenant?.subscription ?? null;
  const planName = subscription?.planName || "No Plan";
  const subscriptionLifecycleStatus = String(tenant?.subscriptionData?.status || "").toUpperCase();
  const currentAgentStatus = user?.status || USER_STATUS.OFFLINE;

  const statusBadge = (() => {
    switch (currentAgentStatus) {
      case USER_STATUS.AVAILABLE:
        return { label: "Available", color: "bg-green-500" };
      case USER_STATUS.BUSY:
        return { label: "Busy", color: "bg-amber-500" };
      case USER_STATUS.AWAY:
        return { label: "Away", color: "bg-yellow-500" };
      case USER_STATUS.OFFLINE:
      default:
        return { label: "Offline", color: "bg-gray-400" };
    }
  })();

  const authUser: AuthUser | null =
    tenant?.companyName && user?.role && subscription?.planName && subscription?.startDate && subscription?.endDate
      ? {
        companyName: tenant.companyName,
        role: user.role,
        subscription: {
          planName: subscription.planName,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
        },
      }
      : null;
  const subscriptionStartDate = authUser?.subscription.startDate || subscription?.startDate;
  const subscriptionEndDate = authUser?.subscription.endDate || subscription?.endDate;

  const subscriptionStatus = (() => {
    if (subscriptionLifecycleStatus === "DEACTIVATED") {
      return {
        label: "Deactivated",
        detail: "No days left",
        tone: "danger" as const,
      };
    }

    if (subscriptionLifecycleStatus === "EXPIRED") {
      return {
        label: "Expired",
        detail: "No days left",
        tone: "danger" as const,
      };
    }

    if (subscriptionLifecycleStatus && subscriptionLifecycleStatus !== "ACTIVATED") {
      return {
        label: "Inactive",
        detail: "Not active",
        tone: "neutral" as const,
      };
    }

    if (!subscriptionEndDate) {
      return {
        label: "Unlimited",
        detail: "No expiration date",
        tone: "info" as const,
      };
    }

    const parseAsLocalCalendarDate = (value: string | Date) => {
      if (value instanceof Date) {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
      }

      const trimmedValue = String(value).trim();
      const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmedValue);

      if (dateOnlyMatch) {
        const year = Number(dateOnlyMatch[1]);
        const monthIndex = Number(dateOnlyMatch[2]) - 1;
        const day = Number(dateOnlyMatch[3]);
        return new Date(year, monthIndex, day);
      }

      const parsed = new Date(trimmedValue);
      if (Number.isNaN(parsed.getTime())) {
        return null;
      }

      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    };

    const end = parseAsLocalCalendarDate(subscriptionEndDate);
    if (!end || Number.isNaN(end.getTime())) {
      return {
        label: "Unknown",
        detail: "Unable to determine expiration",
        tone: "neutral" as const,
      };
    }

    const now = new Date(timeTick);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const msPerDay = 1000 * 60 * 60 * 24;
    const dayDiff = Math.floor((end.getTime() - today.getTime()) / msPerDay);

    if (dayDiff < 0) {
      return {
        label: "Expired",
        detail: "No days left",
        tone: "danger" as const,
      };
    }

    if (dayDiff === 0) {
      return {
        label: "Expires Today",
        detail: "Last active day",
        tone: "warning" as const,
      };
    }

    if (dayDiff <= 7) {
      return {
        label: "Expires Soon",
        detail: `${dayDiff} day${dayDiff === 1 ? "" : "s"} left`,
        tone: "warning" as const,
      };
    }

    return {
      label: "Active",
      detail: `${dayDiff} day${dayDiff === 1 ? "" : "s"} left`,
      tone: "success" as const,
    };
  })();

  const activeNavCls = "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
  const inactiveNavCls =
    "text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700/60";
  const sidebarLogoVariant: "light" | "dark" | "main" = isSidebarOpen
    ? (isDark ? "light" : "dark")
    : "main";

  useEffect(() => {
    setProfileImageFailed(false);
  }, [userProfilePicture]);

  return (
    <div className={`min-h-screen w-full overflow-x-hidden flex font-sans bg-gray-50 dark:bg-slate-900 transition-colors duration-300${isDark ? " dark" : ""}`}>
      {isMobile && isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/40 md:hidden"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`${isSidebarOpen ? "translate-x-0 md:w-56" : "-translate-x-full md:translate-x-0 md:w-20"
          } w-[86vw] max-w-72 md:max-w-none bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col fixed top-0 left-0 h-screen shrink-0 z-30 transition-all duration-300`}
      >
        {/* Logo row */}
        <div className={`h-16 flex items-center ${isSidebarOpen ? "justify-between px-4" : "justify-center px-2"} border-b border-gray-100 dark:border-slate-700`}>
          {isSidebarOpen ? (
            <div className="flex w-full items-center justify-center overflow-hidden">
              <Logo
                variant={sidebarLogoVariant}
                alt="JAF Chatra Logo"
                style={{ height: "32px", maxWidth: "140px" }}
                className="mx-auto"
              />
            </div>
          ) : (
            <Logo
              variant={sidebarLogoVariant}
              alt="JAF Chatra Minimized"
              style={{ height: "46px" }}
              className="mx-auto"
            />
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:inline-flex p-1.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors absolute -right-3 top-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-sm z-20"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3">
          {sidebarGroups.map((group, groupIndex) => (
            <div key={group.id} className={groupIndex > 0 ? "mt-5" : ""}>
              {isSidebarOpen ? (
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3">
                  {group.label}
                </p>
              ) : (
                groupIndex > 0 && <div className="h-px bg-gray-200 dark:bg-slate-700 w-8 mx-auto my-4"></div>
              )}

              {group.modules.map((module) => {
                return (
                  <Tooltip
                    key={module.id}
                    title={module.label}
                    placement={isSidebarOpen ? "right" : "right"}
                  >
                    <button
                      onClick={() => handleModuleNavigation(module.path)}
                      className={`w-full flex items-center ${isSidebarOpen ? "justify-start px-3" : "justify-center px-0"} py-2.5 rounded-lg text-sm font-medium transition-colors ${isActivePath(module.path) ? activeNavCls : inactiveNavCls}`}
                    >
                      <span className={`${isSidebarOpen ? "mr-3" : ""} shrink-0`}>
                        {module.icon}
                      </span>
                      {isSidebarOpen && <span>{module.label}</span>}
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main
        className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarOpen
          ? "ml-0 w-full md:ml-56 md:w-[calc(100%-14rem)]"
          : "ml-0 w-full md:ml-20 md:w-[calc(100%-5rem)]"
          }`}
      >
        {/* Top header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-3 sm:px-4 md:px-8 sticky top-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-6 min-w-0">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>
            <div className="relative hidden md:flex items-center gap-3 min-w-0">
              <Typography
                variant="body2"
                sx={{
                  color: isDark ? "#CBD5E1" : "#475569",
                  fontWeight: 600,
                  maxWidth: "220px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {companyName}
              </Typography>
              {isAdmin && (
                <div
                  className="relative"
                  onMouseEnter={() => setIsPlanPopupOpen(true)}
                  onMouseLeave={() => setIsPlanPopupOpen(false)}
                >
                  <Chip
                    label={planName}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 24,
                      marginRight: 1,
                      borderColor: isDark ? "#334155" : "#CBD5E1",
                      color: isDark ? "#E2E8F0" : "#334155",
                      backgroundColor: isDark ? "rgba(30,41,59,0.35)" : "#F8FAFC",
                      "& .MuiChip-label": {
                        px: 1.2,
                        fontWeight: 500,
                      },
                    }}
                  />
                  <Chip
                    label={subscriptionStatus.detail}
                    size="small"
                    sx={{
                      height: 24,
                      border: "none",
                      fontWeight: 700,
                      color:
                        subscriptionStatus.tone === "danger"
                          ? "#B91C1C"
                          : subscriptionStatus.tone === "warning"
                            ? "#92400E"
                            : subscriptionStatus.tone === "success"
                              ? "#166534"
                              : isDark
                                ? "#E2E8F0"
                                : "#334155",
                      backgroundColor:
                        subscriptionStatus.tone === "danger"
                          ? "#FEE2E2"
                          : subscriptionStatus.tone === "warning"
                            ? "#FEF3C7"
                            : subscriptionStatus.tone === "success"
                              ? "#DCFCE7"
                              : isDark
                                ? "rgba(30,41,59,0.55)"
                                : "#F1F5F9",
                      "& .MuiChip-label": {
                        px: 1.2,
                      },
                    }}
                  />

                  <div
                    className={`absolute left-1/2 top-full z-30 mt-3 w-[22rem] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl shadow-slate-900/10 transition-all duration-200 dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-950/40 ${isPlanPopupOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"}`}
                  >
                    <div className="mb-4 flex items-start gap-3">
                      <span className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-sky-500" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Subscription
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {planName}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div
                        className={`rounded-xl px-3 py-2 ${subscriptionStatus.tone === "danger"
                          ? "bg-red-50 text-red-700 dark:bg-red-900/25 dark:text-red-300"
                          : subscriptionStatus.tone === "warning"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300"
                            : subscriptionStatus.tone === "success"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200"
                          }`}
                      >
                        <Typography variant="caption" sx={{ color: "inherit", opacity: 0.9 }}>
                          Status
                        </Typography>
                        <Typography variant="body2" sx={{ color: "inherit", fontWeight: 700, lineHeight: 1.2 }}>
                          {subscriptionStatus.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "inherit", opacity: 0.95 }}>
                          {subscriptionStatus.detail}
                        </Typography>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-700/80">
                        <Typography variant="caption" sx={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                          Plan
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDark ? "#E2E8F0" : "#334155", fontWeight: 600 }}>
                          {planName}
                        </Typography>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-700/80">
                        <Typography variant="caption" sx={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                          Started
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDark ? "#E2E8F0" : "#334155", fontWeight: 600 }}>
                          {subscriptionStartDate ? formatDate(subscriptionStartDate) : "-"}
                        </Typography>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <Typography variant="caption" sx={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                          Expires
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDark ? "#E2E8F0" : "#334155", fontWeight: 600, textAlign: "right" }}>
                          {subscriptionEndDate ? formatDate(subscriptionEndDate) : "Unlimited for Internal Plan"}
                        </Typography>
                      </div>
                    </div>

                    <Stack direction="row" justifyContent="center" className="mt-4">
                      <Button fullWidth variant="outlined" onClick={() => navigate(`/portal/tenants/${tenant?.id}`)}>
                        View subscription details
                      </Button>
                    </Stack>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Agent Status */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${statusBadge.color}`}></span>
                <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-slate-300">
                  {statusBadge.label}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              </button>

              {isStatusOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsStatusOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-40 sm:w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg dark:shadow-slate-900/50 z-50 py-1 -right-2 sm:right-0">
                    {[
                      { label: "Available", color: "bg-green-500", value: USER_STATUS.AVAILABLE },
                      { label: "Away", color: "bg-yellow-500", value: USER_STATUS.AWAY },
                    ].map(({ label, color, value }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          void handleStatusChange(value);
                        }}
                        className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60 flex items-center gap-3 transition-colors"
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`}></span>
                        <span className="truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="relative p-2 rounded-lg text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Profile */}
            <div className="relative">
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/60 p-1.5 pr-3 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-600 ml-1"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: getAvatarColor(),
                    fontSize: "0.875rem",
                    fontWeight: 700,
                  }}
                  src={user?.profilePicture || ''}
                >
                  {userInitial}
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-none">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{toTitleCase(userRole)}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500 hidden lg:block" />
              </div>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg dark:shadow-slate-900/50 z-50 py-2 max-h-96 overflow-y-auto -right-2 sm:right-0">
                    <div className="px-3 sm:px-4 py-2 border-b border-gray-100 dark:border-slate-700 mb-1 flex items-center gap-2.5 min-w-0">
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: getAvatarColor(),
                          fontSize: "0.875rem",
                          fontWeight: 700,
                        }}
                        src={user?.profilePicture || ''}
                      >
                        {userInitial}
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{userName}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{userEmail}</p>
                      </div>
                    </div>
                    <div className="px-3 sm:px-4 py-2 border-b border-gray-100 dark:border-slate-700 mb-1">
                      <Typography variant="caption" sx={{ color: isDark ? "#94A3B8" : "#64748B", fontSize: "0.7rem" }}>
                        Role
                      </Typography>
                      <Typography variant="body2" sx={{ color: isDark ? "#E2E8F0" : "#334155", fontWeight: 600, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {toTitleCase(userRole)}
                      </Typography>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/portal/account-settings");
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-2"
                    >
                      <Settings2 className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Account Settings</span>
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        void handleLogout();
                      }}
                      className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Log out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Child route content */}
        <div className="p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </main>

      <AutoLogoutModal
        open={isAutoLogoutOpen}
        secondsLeft={autoLogoutSecondsLeft}
        onStaySignedIn={handleStaySignedIn}
        onLogoutNow={() => {
          void handleLogout();
        }}
      />
    </div>
  );
}

// ── Public export wraps inner layout with the dark-mode provider ───────────────

export function DashboardLayout() {
  return (
    <DarkModeProvider>
      <DashboardLayoutInner />
    </DarkModeProvider>
  );
}

export default DashboardLayout;
