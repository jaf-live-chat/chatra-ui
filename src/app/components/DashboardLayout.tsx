import { useState, useEffect } from "react";
import {
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Headset,
  Settings2,
  ListOrdered,
  BarChart2,
  MessagesSquare,
  Bell,
  Building2,
  Crown,
  Moon,
  Sun,
  Menu,
  Zap,
  Bot,
} from "lucide-react";
import { Link, Outlet, useNavigate, useLocation, useSearchParams } from "react-router";
import { DarkModeProvider, useDarkMode } from "./DarkModeContext";

const jafChatraLogo = "https://res.cloudinary.com/dvrhry6ru/image/upload/v1773735919/logo3_a0x3s4.png";

// ── Inner layout (consumes dark-mode context) ──────────────────────────────────

function DashboardLayoutInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
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

  const isChatSessions = location.pathname === "/dashboard/chat-sessions";
  const currentTab = searchParams.get("tab") || "overview";

  const isActive = (tab: string) => {
    if (isChatSessions) return false;
    if (tab === "dashboard") return currentTab === "overview" || currentTab === "dashboard";
    return currentTab === tab;
  };

  const navTo = (tab: string) => {
    navigate(tab === "dashboard" ? "/dashboard" : `/dashboard?tab=${tab}`);
  };

  const activeNavCls = "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
  const inactiveNavCls =
    "text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700/60";

  return (
    <div className={`min-h-screen flex font-sans bg-gray-50 dark:bg-slate-900 transition-colors duration-300${isDark ? " dark" : ""}`}>
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"
          } bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col fixed h-full z-10 transition-all duration-300`}
      >
        {/* Logo row */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-slate-700">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src={jafChatraLogo}
                alt="JAF Chatra Logo"
                style={{ height: "104px", width: "auto" }}
                className="ml-6"
              />
            </div>
          ) : (
            <img
              src={jafChatraLogo}
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
          {isSidebarOpen && (
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3">
              Menu
            </p>
          )}

          {/* Dashboard */}
          <button
            onClick={() => navTo("dashboard")}
            className={`flex items-center ${isSidebarOpen ? "justify-start px-3" : "justify-center px-0"
              } py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("dashboard") ? activeNavCls : inactiveNavCls
              }`}
            title="Dashboard"
          >
            <LayoutDashboard className={`w-5 h-5 ${isSidebarOpen ? "mr-3" : ""} shrink-0`} />
            {isSidebarOpen && <span>Dashboard</span>}
          </button>

          {/* Analytics */}
          <button
            onClick={() => navTo("analytics")}
            className={`flex items-center ${isSidebarOpen ? "justify-start px-3" : "justify-center px-0"
              } py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("analytics") ? activeNavCls : inactiveNavCls
              }`}
            title="Analytics"
          >
            <BarChart2 className={`w-5 h-5 ${isSidebarOpen ? "mr-3" : ""} shrink-0`} />
            {isSidebarOpen && <span>Analytics</span>}
          </button>

          {/* Agents */}
          <button
            onClick={() => navTo("agents")}
            className={`flex items-center ${isSidebarOpen ? "justify-start px-3" : "justify-center px-0"
              } py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("agents") ? activeNavCls : inactiveNavCls
              }`}
            title="Agents"
          >
            <Headset className={`w-5 h-5 ${isSidebarOpen ? "mr-3" : ""} shrink-0`} />
            {isSidebarOpen && <span>Agents</span>}
          </button>

          {/* Live Chat divider */}
          {isSidebarOpen ? (
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-6 mb-2 px-3">
              Live Chat
            </p>
          ) : (
            <div className="h-px bg-gray-200 dark:bg-slate-700 w-8 mx-auto my-4"></div>
          )}

          {/* Queue */}
          <button
            onClick={() => navTo("queue")}
            className={`flex items-center ${isSidebarOpen ? "justify-start px-3" : "justify-center px-0"
              } py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("queue") ? activeNavCls : inactiveNavCls
              }`}
            title="Queue"
          >
            <ListOrdered className={`w-5 h-5 ${isSidebarOpen ? "mr-3" : ""} shrink-0`} />
            {isSidebarOpen && <span>Queue</span>}
          </button>

          {/* Chat Sessions */}
          <Link
            to="/dashboard/chat-sessions"
            className={`flex items-center ${isSidebarOpen ? "justify-start px-3" : "justify-center px-0"
              } py-2.5 rounded-lg text-sm font-medium transition-colors ${isChatSessions ? activeNavCls : inactiveNavCls
              }`}
            title="Chat Sessions"
          >
            <MessagesSquare className={`w-5 h-5 shrink-0 ${isSidebarOpen ? "mr-3" : ""}`} />
            {isSidebarOpen && <span>Chat Sessions</span>}
          </Link>

          {/* Settings divider */}
          {isSidebarOpen ? (
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-6 mb-2 px-3">
              Settings
            </p>
          ) : (
            <div className="h-px bg-gray-200 dark:bg-slate-700 w-8 mx-auto my-4"></div>
          )}

          {/* Widget Settings */}
          <button
            onClick={() => navTo("widget-settings")}
            className={`flex items-center ${isSidebarOpen ? "justify-start px-3" : "justify-center px-0"
              } py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("widget-settings") ? activeNavCls : inactiveNavCls
              }`}
            title="Widget Settings"
          >
            <Settings2 className={`w-5 h-5 ${isSidebarOpen ? "mr-3" : ""} shrink-0`} />
            {isSidebarOpen && <span>Widget Settings</span>}
          </button>

          {/* Company Info */}
          <button
            onClick={() => navTo("company-info")}
            className={`flex items-center ${isSidebarOpen ? "justify-start px-3" : "justify-center px-0"
              } py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("company-info") ? activeNavCls : inactiveNavCls
              }`}
            title="Company Info"
          >
            <Building2 className={`w-5 h-5 ${isSidebarOpen ? "mr-3" : ""} shrink-0`} />
            {isSidebarOpen && <span>Company Info</span>}
          </button>

          {/* Tools divider */}
          {isSidebarOpen ? (
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-6 mb-2 px-3">
              Tools
            </p>
          ) : (
            <div className="h-px bg-gray-200 dark:bg-slate-700 w-8 mx-auto my-4"></div>
          )}

          {/* Tools */}
          <button
            onClick={() => navTo("tools")}
            className={`flex items-center ${isSidebarOpen ? "justify-start px-3" : "justify-center px-0"
              } py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("tools") ? activeNavCls : inactiveNavCls
              }`}
            title="Tools"
          >
            <Zap className={`w-5 h-5 ${isSidebarOpen ? "mr-3" : ""} shrink-0`} />
            {isSidebarOpen && <span>Tools</span>}
          </button>

          {/* Account Settings */}
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-6">
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>
            <div className="w-72 relative hidden md:block"></div>
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
                      { label: "Offline", color: "bg-gray-400", value: "Offline" },
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
                  A
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-none">
                    Admin User
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
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Admin User</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">admin@jaflivechat.com</p>
                    </div>
                    <button
                      onClick={() => { navTo("account-settings"); setIsProfileOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-2"
                    >
                      <Settings2 className="w-4 h-4" /> Account Settings
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                    <Link
                      to="/login"
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
        <Outlet />
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