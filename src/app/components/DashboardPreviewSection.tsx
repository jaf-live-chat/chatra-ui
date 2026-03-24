import {
  LayoutDashboard,
  MessageSquare,
  Users,
  UserCheck,
  Settings,
  CreditCard,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { APP_LOGO } from "../../constants";

const navItems = [
  { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard", active: true },
  { icon: <MessageSquare className="w-4 h-4" />, label: "Conversations", badge: "24" },
  { icon: <Users className="w-4 h-4" />, label: "Visitors" },
  { icon: <UserCheck className="w-4 h-4" />, label: "Agents" },
  { icon: <Settings className="w-4 h-4" />, label: "Settings" },
  { icon: <CreditCard className="w-4 h-4" />, label: "Billing" },
];

const stats = [
  { label: "Active Chats", value: "24", change: "+12%", icon: <MessageSquare className="w-5 h-5" />, color: "bg-blue-100 text-blue-600", trend: "up" },
  { label: "Visitors Online", value: "138", change: "+8%", icon: <Users className="w-5 h-5" />, color: "bg-yellow-100 text-yellow-700", trend: "up" },
  { label: "Pending Messages", value: "7", change: "-3%", icon: <Clock className="w-5 h-5" />, color: "bg-gray-100 text-gray-600", trend: "down" },
  { label: "Average Response Time", value: "1m 12s", change: "-15s", icon: <Clock className="w-5 h-5" />, color: "bg-sky-50 text-sky-500", trend: "up" },
];

const recentChats = [
  { name: "Sarah Mitchell", msg: "I need help with subscription", agentAssigned: "Mark T.", status: "active", time: "now" },
  { name: "James Owens", msg: "How do I install the widget?", agentAssigned: "Sarah J.", status: "active", time: "1m" },
  { name: "Priya Sharma", msg: "Is there an API available?", agentAssigned: "Unassigned", status: "pending", time: "3m" },
  { name: "Tom Baker", msg: "Great support, thanks!", agentAssigned: "Lisa M.", status: "resolved", time: "7m" },
  { name: "Anna Lee", msg: "Can I upgrade my plan?", agentAssigned: "Mark T.", status: "active", time: "9m" },
];

export function DashboardPreviewSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pointer-events-none select-none">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-4"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", fontWeight: 600 }}
          >
            Dashboard Preview
          </span>
          <h2
            className="text-gray-900 mb-4"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              lineHeight: "1.2",
              letterSpacing: "-0.02em",
            }}
          >
            A powerful command center for your team
          </h2>
          <p
            className="text-gray-500"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "1rem", lineHeight: "1.7" }}
          >
            Get a clear overview of all conversations, visitors, and agent performance from one sleek admin panel.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
          style={{ background: "#f8fafc" }}
        >
          {/* Title Bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-950">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-gray-800 rounded-md px-4 py-1 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-300" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.7rem" }}>
                  app.jaflivechat.com/dashboard
                </span>
              </div>
            </div>
          </div>

          <div className="flex" style={{ height: "480px" }}>
            {/* Sidebar */}
            <div className="w-48 bg-gray-950 flex flex-col py-4">
              {/* Logo */}
              <div className="flex items-center gap-2 px-4 mb-6">
                <img src={APP_LOGO.logoDark} alt="JAF Chatra" className="h-8 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
              </div>

              {/* Nav Items */}
              <nav className="flex-1 space-y-0.5 px-2">
                {navItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg ${item.active
                      ? "bg-blue-600 text-white"
                      : "text-gray-400"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", fontWeight: 500 }}>
                        {item.label}
                      </span>
                    </div>
                    {item.badge && (
                      <span
                        className="bg-yellow-400 text-gray-900 rounded-full px-1.5"
                        style={{ fontSize: "0.6rem", fontWeight: 700 }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}
              </nav>

              {/* Agent Status */}
              <div className="px-4 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center">
                    <span className="text-white" style={{ fontSize: "0.6rem", fontWeight: 700 }}>JA</span>
                  </div>
                  <div>
                    <p className="text-white" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.7rem", fontWeight: 600 }}>John Agent</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      <p className="text-gray-400" style={{ fontSize: "0.6rem" }}>Online</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden p-5 bg-gray-50">
              {/* Page Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-gray-900" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "1rem" }}>
                    Dashboard Overview
                  </h3>
                  <p className="text-gray-400" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem" }}>
                    Wednesday, March 11, 2026 — 2:47 PM
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", fontWeight: 600 }}>Live</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                        {stat.icon}
                      </div>
                      <span
                        className={stat.trend === "up" ? "text-green-500" : "text-blue-400"}
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "0.65rem", fontWeight: 600 }}
                      >
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-gray-900" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "1.2rem" }}>
                      {stat.value}
                    </p>
                    <p className="text-gray-400" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.65rem" }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent Chats Table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h4 className="text-gray-700" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "0.8rem" }}>
                    Recent Conversations
                  </h4>
                  <button className="text-blue-600" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", fontWeight: 600 }}>
                    View All
                  </button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Visitor Name", "Message Preview", "Agent Assigned", "Status", "Time"].map((col) => (
                        <th
                          key={col}
                          className="text-left px-4 py-2 text-gray-400"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentChats.map((chat, i) => (
                      <tr key={chat.name} className={`border-t border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-4 py-2.5">
                          <span className="text-gray-700" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", fontWeight: 600 }}>
                            {chat.name}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-gray-500 truncate max-w-[150px] block" style={{ fontSize: "0.65rem" }}>
                            {chat.msg}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`font-mono ${chat.agentAssigned === "Unassigned" ? "text-gray-400 italic" : "text-gray-700"}`} style={{ fontSize: "0.65rem" }}>{chat.agentAssigned}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full capitalize ${chat.status === "active"
                              ? "bg-green-100 text-green-700"
                              : chat.status === "pending"
                                ? "bg-yellow-400 text-yellow-900 border border-yellow-500"
                                : "bg-blue-100 text-blue-700"
                              }`}
                            style={{ fontFamily: "Inter, sans-serif", fontSize: "0.6rem", fontWeight: 600 }}
                          >
                            {chat.status === "active" ? (
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            ) : chat.status === "pending" ? (
                              <Clock className="w-2.5 h-2.5" />
                            ) : (
                              <Circle className="w-2.5 h-2.5" />
                            )}
                            {chat.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-gray-400" style={{ fontSize: "0.65rem" }}>{chat.time}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="h-8 -mt-1 rounded-b-2xl" style={{ background: "linear-gradient(to bottom, transparent, white)" }}></div>
      </div>
    </section>
  );
}
