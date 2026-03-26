import { useState, useEffect } from "react";
import {
  ChevronDown,
  LogOut,
  Settings2,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { Link, Outlet, useNavigate, useLocation } from "react-router";
import { Chip, Tooltip, Typography } from "@mui/material";
import { DarkModeProvider, useDarkMode } from "../providers/DarkModeContext";
import { APP_LOGO } from "../constants/constants";
import useAuth from "../hooks/useAuth";
import { MODULE_GROUPS } from "../constants/modules";
import filterModulesByRole from "../utils/filterModules";
import { formatDate } from "../utils/dateFormatter";
import type { AuthUser, UserRole } from "../models/AgentModel";
import toTitleCase from "../utils/toTitleCase";

// ── Inner layout (consumes dark-mode context) ──────────────────────────────────

function DashboardLayoutInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [agentStatus, setAgentStatus] = useState(() => {
    try { return localStorage.getItem("jaf_agent_status") || "Online"; } catch { return "Online"; }
  });

  useEffect(() => {
    const handleStatusChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.status) setAgentStatus(detail.status);
    };
    window.addEventListener("jaf_agent_status_changed", handleStatusChange);
    return () => window.removeEventListener("jaf_agent_status_changed", handleStatusChange);
  }, []);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const { isDark, toggleDark } = useDarkMode();
  const { user, tenant, logout } = useAuth();
  const roleFilteredGroups = filterModulesByRole(MODULE_GROUPS, user?.role);
  const sidebarGroups = roleFilteredGroups
    .map((group) => ({
      ...group,
      modules: filterModulesByRole(group.modules, user?.role).filter(
        (module) =>
          module.path !== "/portal/agent" && !module.path.startsWith("/portal/agent/")
      ),
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

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || "U";
  const userName = user?.fullName || "User";
  const userEmail = user?.emailAddress || "";
  const companyName = tenant?.companyName || "-";
  const userRole = (user?.role || "-") as UserRole | "-";
  const subscription = tenant?.subscription ?? null;
  const planName = subscription?.planName || "No Plan";

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

  const activeNavCls = "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
  const inactiveNavCls =
    "text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700/60";

  return (
    <div className={`min-h-screen w-full overflow-x-hidden flex font-sans bg-gray-50 dark:bg-slate-900 transition-colors duration-300${isDark ? " dark" : ""}`}>
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`${isSidebarOpen ? "w-full md:w-56" : "w-20"
          } bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col fixed top-0 left-0 h-screen shrink-0 z-10 transition-all duration-300`}
      >
        {/* Logo row */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-slate-700">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src={APP_LOGO.logoDark}
                alt="JAF Chatra Logo"
                style={{ height: "104px", width: "auto" }}
                className="ml-6"
              />
            </div>
          ) : (
            <img
              src={APP_LOGO.logoDark}
              alt="JAF Chatra Minimized"
              style={{ height: "36px", width: "auto", objectFit: "contain" }}
              className="-ml-1"
            />
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors absolute -right-3 top-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-sm z-20"
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
                  <button
                    key={module.id}
                    onClick={() => navigate(module.path)}
                    className={`w-full flex items-center ${isSidebarOpen ? "justify-start px-3" : "justify-center px-0"} py-2.5 rounded-lg text-sm font-medium transition-colors ${isActivePath(module.path) ? activeNavCls : inactiveNavCls}`}
                    title={module.label}
                  >
                    <span className={`${isSidebarOpen ? "mr-3" : ""} shrink-0`}>
                      {module.icon}
                    </span>
                    {isSidebarOpen && <span>{module.label}</span>}
                  </button>
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
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-6 min-w-0">
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
              <Tooltip
                arrow
                placement="bottom"
                title={
                  <div className="py-1">
                    <Typography variant="caption" sx={{ display: "block", color: "#E2E8F0" }}>
                      Plan: {planName}
                    </Typography>
                    <Typography variant="caption" sx={{ display: "block", color: "#E2E8F0" }}>
                      Start: {subscriptionStartDate
                        ? formatDate(subscriptionStartDate)
                        : "-"}
                    </Typography>
                    <Typography variant="caption" sx={{ display: "block", color: "#E2E8F0" }}>
                      End: {subscriptionEndDate
                        ? formatDate(subscriptionEndDate)
                        : "-"}
                    </Typography>
                  </div>
                }
              >
                <Chip
                  label={planName}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 24,
                    borderColor: isDark ? "#334155" : "#CBD5E1",
                    color: isDark ? "#E2E8F0" : "#334155",
                    backgroundColor: isDark ? "rgba(30,41,59,0.35)" : "#F8FAFC",
                    "& .MuiChip-label": {
                      px: 1.2,
                      fontWeight: 500,
                    },
                  }}
                />
              </Tooltip>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Agent Status */}
            <div className="relative">
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <span
                  className={`w-2 h-2 rounded-full ${agentStatus === "Online"
                    ? "bg-green-500"
                    : agentStatus === "Busy"
                      ? "bg-yellow-500"
                      : agentStatus === "Do not Disturb"
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                ></span>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {agentStatus}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500 ml-1" />
              </button>

              {isStatusOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsStatusOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg dark:shadow-slate-900/50 z-50 py-1">
                    {[
                      { label: "Online", color: "bg-green-500", value: "Online" },
                      { label: "Busy", color: "bg-yellow-500", value: "Busy" },
                      { label: "Away", color: "bg-gray-400", value: "Away" },
                    ].map(({ label, color, value }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setAgentStatus(value);
                          setIsStatusOpen(false);
                          try { localStorage.setItem("jaf_agent_status", value); } catch { /* ignore */ }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60 flex items-center gap-3 transition-colors"
                      >
                        <span className={`w-2 h-2 rounded-full ${color}`}></span> {label}
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
                <div className="w-8 h-8 bg-gray-900 dark:bg-cyan-700 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {userInitial}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-none">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">My Profile</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500 hidden lg:block" />
              </div>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg dark:shadow-slate-900/50 z-50 py-2">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{userName}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{userEmail}</p>
                    </div>
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 mb-1">
                      <Typography variant="caption" sx={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                        Role
                      </Typography>
                      <Typography variant="body2" sx={{ color: isDark ? "#E2E8F0" : "#334155", fontWeight: 600 }}>
                        {toTitleCase(userRole)}
                      </Typography>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/portal/account-settings");
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-2"
                    >
                      <Settings2 className="w-4 h-4" /> Account Settings
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                    <Link
                      to="/login"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Child route content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
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
