import { useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  CreditCard,
  Settings,
  HeadphonesIcon,
  Bell,
  ChevronDown,
  LogOut,
  User,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  ExternalLink,
  Code2,
  Wifi,
  WifiOff,
  Users,
  Zap,
  Star,
  HelpCircle,
  Send,
  X,
  ChevronLeft,
  Menu,
  TrendingUp,
  RefreshCw,
  FileText,
  Shield,
  Globe,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Ticket,
  BookOpen,
  ChevronRight,
  Activity,
  Circle,
  ArrowRight,
  Info,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import jafChatraLogo from "figma:asset/bfc6c96e2889ab05988e23557e5e8d5f485d15bd.png";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ACCOUNT = {
  name: "Acme Corporation",
  email: "admin@acmecorp.com",
  avatar: "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW58MXx8fHwxNzczMzAxNzQ1fDA&ixlib=rb-4.1.0&q=80&w=200",
  plan: "Pro",
  status: "Active",
  lastLogin: "Mar 13, 2026 at 9:41 AM",
  memberSince: "January 2024",
  widgetInstalled: true,
  widgetLive: true,
  billingCycle: "Monthly",
  nextBilling: "Apr 1, 2026",
};

const USAGE_STATS = [
  { label: "Active Chats", value: "12", icon: <MessageSquare className="w-5 h-5" />, color: "text-sky-600", bg: "bg-sky-50", change: "+3 today" },
  { label: "Avg. Response Time", value: "1m 24s", icon: <Clock className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50", change: "↓ 12s faster" },
  { label: "Agents Online", value: "4 / 6", icon: <Users className="w-5 h-5" />, color: "text-violet-600", bg: "bg-violet-50", change: "2 unavailable" },
  { label: "Resolved Today", value: "38", icon: <CheckCircle2 className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50", change: "94% rate" },
];

const CHAT_SUMMARY = [
  { label: "Total Chats Today", value: 41, color: "bg-sky-500" },
  { label: "Avg Response Time", value: "1m 24s", color: "bg-emerald-500" },
  { label: "Resolved Chats", value: 38, color: "bg-violet-500" },
  { label: "Unresolved Chats", value: 3, color: "bg-red-500" },
];

const RECENT_CHATS = [
  { id: "C-5821", visitor: "James Carter", preview: "I need help resetting my password for the portal.", agent: "Sarah M.", time: "10:24 AM", status: "Active", duration: "—" },
  { id: "C-5820", visitor: "Linda Torres", preview: "How do I export my chat history to PDF?", agent: "Mark T.", time: "9:58 AM", status: "Resolved", duration: "6m 12s" },
  { id: "C-5819", visitor: "Kevin Park", preview: "The billing page is showing an error 500.", agent: "Sarah M.", time: "9:33 AM", status: "Resolved", duration: "14m 48s" },
  { id: "C-5818", visitor: "Angela West", preview: "Can I add a second workspace under my plan?", agent: "Unassigned", time: "9:01 AM", status: "Pending", duration: "—" },
  { id: "C-5817", visitor: "Tom Brooks", preview: "Thanks, everything is sorted now!", agent: "Lisa R.", time: "Yesterday", status: "Resolved", duration: "22m 05s" },
];

const QUEUE = [
  { id: "Q-101", name: "Diana Prince", message: "Looking for plan upgrade info", wait: "2m 10s", priority: "High" },
  { id: "Q-102", name: "Bruce Wayne", message: "API key not working after renewal", wait: "5m 48s", priority: "Medium" },
  { id: "Q-103", name: "Clark Kent", message: "Billing address change request", wait: "8m 32s", priority: "Low" },
  { id: "Q-104", name: "Barry Allen", message: "Widget not loading on our site", wait: "11m 05s", priority: "High" },
];

const AGENTS = [
  { name: "Sarah Mitchell", role: "Lead Agent", available: true, chats: 3 },
  { name: "Mark Thompson", role: "Support Agent", available: true, chats: 2 },
  { name: "Lisa Rivera", role: "Support Agent", available: false, chats: 0 },
  { name: "David Chen", role: "Support Agent", available: true, chats: 1 },
  { name: "Priya Nair", role: "Junior Agent", available: false, chats: 0 },
  { name: "Jake Foster", role: "Support Agent", available: true, chats: 4 },
];

const PAYMENT_HISTORY = [
  { id: "INV-2026-012", date: "Mar 1, 2026", amount: "$99.00", plan: "Pro", status: "Paid" },
  { id: "INV-2026-011", date: "Feb 1, 2026", amount: "$99.00", plan: "Pro", status: "Paid" },
  { id: "INV-2026-010", date: "Jan 1, 2026", amount: "$99.00", plan: "Pro", status: "Paid" },
  { id: "INV-2025-009", date: "Dec 1, 2025", amount: "$49.00", plan: "Starter", status: "Paid" },
  { id: "INV-2025-008", date: "Nov 1, 2025", amount: "$49.00", plan: "Starter", status: "Paid" },
];

const NOTIFICATIONS = [
  { id: 1, type: "payment", title: "Payment successful", desc: "Your Mar 2026 invoice of $99.00 was paid successfully.", time: "2 days ago", read: false },
  { id: 2, type: "update", title: "New feature: AI Suggestions", desc: "Your agents can now get AI-powered response suggestions. Enable in Settings.", time: "5 days ago", read: false },
  { id: 3, type: "maintenance", title: "Scheduled maintenance", desc: "JAF Live Chat will have a 15-minute maintenance window on Mar 20 at 2:00 AM UTC.", time: "1 week ago", read: true },
  { id: 4, type: "warning", title: "Widget disconnected briefly", desc: "Your chat widget on acmecorp.com went offline for 4 minutes on Mar 8. It is now reconnected.", time: "5 days ago", read: true },
  { id: 5, type: "info", title: "Plan renewal reminder", desc: "Your Pro plan renews on Apr 1, 2026. Ensure your billing details are up to date.", time: "3 days ago", read: false },
];

const WIDGET_CODE = `<script>
  window.jafLiveChatSettings = {
    workspaceId: "ACM-28X9-PROD",
    theme: "#0ea5e9",
    position: "bottom-right"
  };
</script>
<script async src="https://cdn.jaflivechat.com/widget.js"></script>`;

// ─── Nav Items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "overview", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: "chats", label: "Chat History", icon: <MessageSquare className="w-5 h-5" /> },
  { id: "billing", label: "Billing", icon: <CreditCard className="w-5 h-5" /> },
  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  { id: "support", label: "Support", icon: <HeadphonesIcon className="w-5 h-5" /> },
];

// ─── Reusable Card ─────────────────────────────────────────────────────────────

function Card({ title, subtitle, icon, children, action }: { title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">{icon}</div>}
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-green-50 text-green-700 border-green-200",
    Resolved: "bg-slate-100 text-slate-600 border-slate-200",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Paid: "bg-green-50 text-green-700 border-green-200",
    High: "bg-red-50 text-red-700 border-red-200",
    Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Low: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status}
    </span>
  );
}

// ─── Views ────────────────────────────────────────────────────────────────────

function OverviewView({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Account Summary Banner */}
      <div className="bg-gradient-to-br from-sky-600 to-sky-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sky-200 text-xs font-medium uppercase tracking-wider mb-1">Current Plan</p>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Pro Plan
              <span className="text-xs bg-white/20 border border-white/30 px-2.5 py-1 rounded-full font-semibold">Active</span>
            </h2>
            <p className="text-sky-200 text-sm mt-1">Billed monthly · Renews Apr 1, 2026</p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <p className="text-3xl font-bold">$99<span className="text-sky-300 text-base font-normal">/mo</span></p>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("billing")}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Manage Billing
              </button>
              <button className="px-4 py-2 bg-white text-sky-700 rounded-xl text-xs font-semibold hover:bg-sky-50 transition-colors cursor-pointer">
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>

        {/* Account meta */}
        <div className="relative mt-5 pt-5 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-sky-300 text-xs">Account Status</p>
            <p className="font-semibold flex items-center gap-1.5 mt-0.5"><Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" /> Active</p>
          </div>
          <div>
            <p className="text-sky-300 text-xs">Last Activity</p>
            <p className="font-semibold mt-0.5">Mar 13, 2026</p>
          </div>
          <div>
            <p className="text-sky-300 text-xs">Member Since</p>
            <p className="font-semibold mt-0.5">January 2024</p>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {USAGE_STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-xs text-slate-500 font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />{s.change}</p>
          </div>
        ))}
      </div>

      {/* Chat Dashboard + Widget Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Summary */}
        <div className="lg:col-span-2">
          <Card title="Chat Dashboard" subtitle="Today's performance at a glance" icon={<Activity className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {CHAT_SUMMARY.map((s) => (
                <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.color} mb-2`} />
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {/* Agent Availability */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Agent Availability</p>
              <div className="space-y-2">
                {AGENTS.map((a) => (
                  <div key={a.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${a.available ? "bg-emerald-500" : "bg-red-400"}`} />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{a.name}</p>
                        <p className="text-xs text-slate-400">{a.role}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${a.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                      {a.available ? `${a.chats} active chat${a.chats !== 1 ? "s" : ""}` : "Offline"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Widget Status */}
        <div className="space-y-4">
          <Card title="Widget Status" subtitle="Live chat widget integration" icon={<Code2 className="w-4 h-4" />}>
            <div className="text-center py-4">
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${ACCOUNT.widgetLive ? "bg-emerald-50" : "bg-red-50"}`}>
                {ACCOUNT.widgetLive ? <Wifi className="w-8 h-8 text-emerald-600" /> : <WifiOff className="w-8 h-8 text-red-500" />}
              </div>
              <p className="text-sm font-bold text-slate-900 mb-1">{ACCOUNT.widgetLive ? "Widget is Live" : "Widget Offline"}</p>
              <p className="text-xs text-slate-500 mb-4">Installed on <span className="font-medium text-sky-600">acmecorp.com</span></p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left mb-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">Workspace ID</p>
                <p className="text-xs font-mono text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-lg">ACM-28X9-PROD</p>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-sky-200 text-sky-700 rounded-xl text-xs font-semibold hover:bg-sky-50 transition-colors cursor-pointer">
              <Code2 className="w-3.5 h-3.5" /> View Widget Code
            </button>
          </Card>

          {/* Current Queue */}
          <Card title="Live Queue" subtitle="Visitors waiting" icon={<Users className="w-4 h-4" />} action={
            <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-full font-semibold">{QUEUE.length} waiting</span>
          }>
            <div className="space-y-3">
              {QUEUE.slice(0, 3).map((q) => (
                <div key={q.id} className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{q.name}</p>
                    <p className="text-xs text-slate-400 truncate">{q.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {q.wait}</p>
                  </div>
                  <StatusPill status={q.priority} />
                </div>
              ))}
              <button
                onClick={() => setActiveTab("chats")}
                className="w-full text-center text-xs text-sky-600 font-semibold hover:text-sky-800 mt-2 py-1 cursor-pointer"
              >
                View all queue →
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Chats */}
      <Card
        title="Recent Chats"
        subtitle="Latest customer interactions"
        icon={<MessageSquare className="w-4 h-4" />}
        action={
          <button onClick={() => setActiveTab("chats")} className="text-xs text-sky-600 font-semibold hover:text-sky-800 flex items-center gap-1 cursor-pointer">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Visitor</th>
                <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Preview</th>
                <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Agent</th>
                <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
                <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-center pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {RECENT_CHATS.map((c) => (
                <tr key={c.id} className="hover:bg-sky-50/30 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {c.visitor.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">{c.visitor}</p>
                        <p className="text-slate-400 text-xs font-mono">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 max-w-[200px]">
                    <p className="text-xs text-slate-500 truncate">{c.preview}</p>
                  </td>
                  <td className="py-3.5">
                    <p className="text-xs text-slate-700">{c.agent}</p>
                  </td>
                  <td className="py-3.5">
                    <p className="text-xs text-slate-500">{c.time}</p>
                  </td>
                  <td className="py-3.5">
                    <StatusPill status={c.status} />
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer" title="View">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Download transcript">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {c.status !== "Resolved" && (
                        <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="Mark resolved">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ChatHistoryView() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showTranscript, setShowTranscript] = useState<string | null>(null);
  const [showWidgetCode, setShowWidgetCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const allChats = [
    ...RECENT_CHATS,
    { id: "C-5816", visitor: "Monica Green", preview: "Can I switch to annual billing?", agent: "Mark T.", time: "Mar 12", status: "Resolved", duration: "9m 14s" },
    { id: "C-5815", visitor: "Aaron Fox", preview: "The auto-reply is not triggering.", agent: "Lisa R.", time: "Mar 12", status: "Resolved", duration: "17m 30s" },
    { id: "C-5814", visitor: "Chloe Kim", preview: "Need to change account email.", agent: "David C.", time: "Mar 11", status: "Resolved", duration: "5m 02s" },
  ];

  const filtered = allChats.filter(c =>
    (filter === "All" || c.status === filter) &&
    (c.visitor.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(WIDGET_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Widget Integration Status */}
      <Card title="Live Chat Widget Integration" subtitle="Widget installation and status" icon={<Code2 className="w-4 h-4" />}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Wifi className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">Widget Installed & Live <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">● Live</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Installed on <span className="text-sky-600 font-medium">acmecorp.com</span> · Last heartbeat 2 minutes ago</p>
            </div>
          </div>
          <button onClick={() => setShowWidgetCode(!showWidgetCode)} className="flex items-center gap-2 px-4 py-2.5 border border-sky-200 text-sky-700 rounded-xl text-xs font-semibold hover:bg-sky-50 transition-colors cursor-pointer shrink-0">
            <Code2 className="w-4 h-4" /> {showWidgetCode ? "Hide" : "View"} Widget Code
          </button>
        </div>
        {showWidgetCode && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-600">Embed this code before the {"</body>"} tag on your website:</p>
              <button onClick={handleCopy} className="text-xs text-sky-600 font-semibold hover:text-sky-800 cursor-pointer">
                {copied ? "✓ Copied!" : "Copy code"}
              </button>
            </div>
            <pre className="bg-slate-900 text-emerald-400 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed">{WIDGET_CODE}</pre>
          </div>
        )}
      </Card>

      {/* Chat History Table */}
      <Card title="Chat History" subtitle="All customer conversations" icon={<MessageSquare className="w-4 h-4" />}>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by visitor or chat ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex gap-2">
            {["All", "Active", "Pending", "Resolved"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${filter === f ? "bg-sky-600 text-white border-sky-600" : "border-slate-200 text-slate-600 hover:border-sky-300"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chat ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Visitor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Agent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No chats found.</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-sky-50/30 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{c.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold shrink-0">{c.visitor.charAt(0)}</div>
                      <span className="text-slate-800 text-xs font-medium">{c.visitor}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 max-w-[180px]"><p className="text-xs text-slate-500 truncate">{c.preview}</p></td>
                  <td className="px-4 py-3.5 text-xs text-slate-700">{c.agent}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{c.duration}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{c.time}</td>
                  <td className="px-4 py-3.5"><StatusPill status={c.status} /></td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setShowTranscript(showTranscript === c.id ? null : c.id)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer" title="View transcript">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Download">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {c.status !== "Resolved" && (
                        <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="Mark resolved">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Queue */}
      <Card title="Current Visitor Queue" subtitle="Visitors waiting to be assisted" icon={<Users className="w-4 h-4" />} action={
        <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full font-semibold">{QUEUE.length} waiting</span>
      }>
        <div className="space-y-3">
          {QUEUE.map((q) => (
            <div key={q.id} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/30 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">{q.name.charAt(0)}</div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{q.name} <span className="text-xs text-slate-400 font-normal font-mono">({q.id})</span></p>
                  <p className="text-xs text-slate-500 truncate">{q.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Waiting {q.wait}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusPill status={q.priority} />
                <button className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 transition-colors cursor-pointer">Assign</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function BillingView({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const [editCard, setEditCard] = useState(false);

  const plans = [
    { name: "Free Trial", price: "$0", chats: "Unlimited chats", agents: "Unlimited", current: false },
    { name: "Starter", price: "$19", chats: "500 chats/mo", agents: "2 agents", current: false },
    { name: "Pro", price: "$49", chats: "5,000 chats/mo", agents: "10 agents", current: true },
    { name: "Business", price: "$129", chats: "Unlimited chats", agents: "25 agents", current: false },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card title="Subscription Plan" subtitle="Manage your current plan" icon={<Zap className="w-4 h-4" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-2xl border-2 p-5 transition-all ${p.current ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-sky-300"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{p.name}</span>
                {p.current && <span className="text-xs bg-sky-600 text-white px-2 py-0.5 rounded-full font-semibold">Current</span>}
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">{p.price}<span className="text-sm text-slate-400 font-normal">{p.price !== "Custom" ? "/mo" : ""}</span></p>
              <p className="text-xs text-slate-500 mb-1">{p.chats}</p>
              <p className="text-xs text-slate-500 mb-4">{p.agents}</p>
              <button className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${p.current ? "bg-sky-600 text-white hover:bg-sky-700" : "border border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-700"}`}>
                {p.current ? "Current Plan" : p.name === "Enterprise" ? "Contact Sales" : "Switch Plan"}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment History + Billing Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Payment History" subtitle="All past invoices and charges" icon={<FileText className="w-4 h-4" />}>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PAYMENT_HISTORY.map((inv) => (
                    <tr key={inv.id} className="hover:bg-sky-50/30 transition-colors">
                      <td className="px-4 py-3.5 text-xs font-mono text-slate-500">{inv.id}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-700">{inv.date}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-700">{inv.plan}</td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-slate-900">{inv.amount}</td>
                      <td className="px-4 py-3.5"><StatusPill status={inv.status} /></td>
                      <td className="px-4 py-3.5 text-center">
                        <button className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 text-xs font-medium cursor-pointer">
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Payment Method */}
          <Card title="Payment Method" icon={<CreditCard className="w-4 h-4" />} action={
            <button onClick={() => setEditCard(!editCard)} className="text-xs text-sky-600 font-semibold hover:text-sky-800 flex items-center gap-1 cursor-pointer">
              <Edit3 className="w-3.5 h-3.5" /> {editCard ? "Cancel" : "Update"}
            </button>
          }>
            {!editCard ? (
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs text-slate-400 font-medium">VISA</p>
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded-full bg-yellow-400 opacity-80" />
                    <div className="w-5 h-5 rounded-full bg-yellow-500 -ml-2.5" />
                  </div>
                </div>
                <p className="text-base font-mono tracking-widest mb-4">•••• •••• •••• 4242</p>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>ACME CORPORATION</span>
                  <span>12/27</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input type="text" placeholder="Card number" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <div className="flex gap-3">
                  <input type="text" placeholder="MM/YY" className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" />
                  <input type="text" placeholder="CVV" className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <button className="w-full py-2.5 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-700 transition-colors cursor-pointer">Save Card</button>
              </div>
            )}
          </Card>

          {/* Billing Address */}
          <Card title="Billing Address" icon={<MapPin className="w-4 h-4" />}>
            <div className="space-y-2 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">Acme Corporation</p>
              <p>123 Business Ave, Suite 400</p>
              <p>San Francisco, CA 94105</p>
              <p>United States</p>
              <p className="text-slate-500">admin@acmecorp.com</p>
            </div>
            <button className="mt-4 w-full py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:border-sky-300 hover:text-sky-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Update Address
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  const [notifications, setNotifications] = useState({
    paymentReminders: true,
    chatSummary: true,
    maintenanceAlerts: false,
    featureUpdates: true,
    agentAlerts: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card title="Account Profile" subtitle="Your account information" icon={<User className="w-4 h-4" />}>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <ImageWithFallback
              src={ACCOUNT.avatar}
              alt="Profile"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-100"
            />
            <button className="text-xs text-sky-600 font-semibold hover:text-sky-800 cursor-pointer">Change photo</button>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Company Name</label>
              <input defaultValue="Acme Corporation" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Email Address</label>
              <input defaultValue="admin@acmecorp.com" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Phone</label>
              <input defaultValue="+1 (415) 555-0192" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Website</label>
              <input defaultValue="https://acmecorp.com" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button onClick={handleSave} className="px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition-colors cursor-pointer">
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </Card>

      {/* Security */}
      <Card title="Security" subtitle="Password and account protection" icon={<Shield className="w-4 h-4" />}>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Confirm New Password</label>
            <input type="password" placeholder="••••••••" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <button className="px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition-colors cursor-pointer">Update Password</button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Two-Factor Auth</span>
              <div className="w-10 h-6 bg-sky-500 rounded-full flex items-center justify-end px-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card title="Notification Preferences" subtitle="Choose what alerts you receive" icon={<Bell className="w-4 h-4" />}>
        <div className="space-y-4 max-w-lg">
          {[
            { key: "paymentReminders", label: "Payment Reminders", desc: "Get notified before your billing date" },
            { key: "chatSummary", label: "Daily Chat Summary", desc: "Receive a daily digest of chat performance" },
            { key: "maintenanceAlerts", label: "Maintenance Alerts", desc: "Be informed of scheduled maintenance windows" },
            { key: "featureUpdates", label: "Feature Updates", desc: "Learn about new features and improvements" },
            { key: "agentAlerts", label: "Agent Availability Alerts", desc: "Get notified when agents go offline" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className={`w-12 h-6 rounded-full transition-colors cursor-pointer flex items-center px-1 shrink-0 ${notifications[key as keyof typeof notifications] ? "bg-sky-500 justify-end" : "bg-slate-200 justify-start"}`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow transition-all" />
              </button>
            </div>
          ))}
          <div className="pt-2">
            <button onClick={handleSave} className="px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition-colors cursor-pointer">
              {saved ? "✓ Saved!" : "Save Preferences"}
            </button>
          </div>
        </div>
      </Card>

      {/* Widget Settings */}
      <Card title="Widget Settings" subtitle="Customize your live chat widget" icon={<Globe className="w-4 h-4" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Widget Position</label>
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer">
              <option>Bottom Right</option>
              <option>Bottom Left</option>
              <option>Top Right</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Widget Color</label>
            <div className="flex items-center gap-2">
              <input type="color" defaultValue="#0ea5e9" className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-1" />
              <input defaultValue="#0ea5e9" className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Welcome Message</label>
            <input defaultValue="Hi! How can we help you today?" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Offline Message</label>
            <input defaultValue="We're offline, leave us a message!" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
        </div>
        <div className="mt-5">
          <button onClick={handleSave} className="px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition-colors cursor-pointer">
            {saved ? "✓ Saved!" : "Save Widget Settings"}
          </button>
        </div>
      </Card>
    </div>
  );
}

function SupportView() {
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: "", category: "Billing", message: "" });
  const [ticketSent, setTicketSent] = useState(false);

  const unread = notifs.filter(n => !n.read).length;

  const notifIcon = (type: string) => {
    if (type === "payment") return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (type === "update") return <Zap className="w-4 h-4 text-sky-500" />;
    if (type === "maintenance") return <Info className="w-4 h-4 text-amber-500" />;
    if (type === "warning") return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Bell className="w-4 h-4 text-slate-400" />;
  };

  const handleSubmitTicket = () => {
    setTicketSent(true);
    setTimeout(() => { setTicketSent(false); setTicketOpen(false); setTicketForm({ subject: "", category: "Billing", message: "" }); }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Send className="w-6 h-6" />, label: "Contact Support", desc: "Chat with our support team live", color: "text-sky-600 bg-sky-50", action: () => setTicketOpen(true) },
          { icon: <Ticket className="w-6 h-6" />, label: "Submit a Ticket", desc: "Open a support request", color: "text-violet-600 bg-violet-50", action: () => setTicketOpen(true) },
          { icon: <BookOpen className="w-6 h-6" />, label: "Help Center", desc: "Browse FAQs & documentation", color: "text-emerald-600 bg-emerald-50", action: () => {} },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-left hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>{item.icon}</div>
            <p className="text-sm font-bold text-slate-900">{item.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
            <p className="text-xs text-sky-600 font-semibold mt-3 flex items-center gap-1">Open <ArrowRight className="w-3 h-3" /></p>
          </button>
        ))}
      </div>

      {/* Notifications */}
      <Card
        title="Notifications"
        subtitle={`${unread} unread`}
        icon={<Bell className="w-4 h-4" />}
        action={
          <button
            onClick={() => setNotifs(prev => prev.map(n => ({ ...n, read: true })))}
            className="text-xs text-sky-600 font-semibold hover:text-sky-800 cursor-pointer"
          >
            Mark all as read
          </button>
        }
      >
        <div className="space-y-3">
          {notifs.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${!n.read ? "border-sky-200 bg-sky-50/40" : "border-slate-100 bg-white"}`}>
              <div className="shrink-0 mt-0.5">{notifIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!n.read ? "text-slate-900" : "text-slate-700"}`}>{n.title}</p>
                  <span className="text-xs text-slate-400 shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
              </div>
              {!n.read && (
                <button
                  onClick={() => setNotifs(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif))}
                  className="shrink-0 p-1 text-slate-300 hover:text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Submit Ticket Modal */}
      {ticketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setTicketOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Submit a Support Ticket</h3>
              <button onClick={() => setTicketOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {ticketSent ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
                  <p className="text-base font-bold text-slate-900">Ticket Submitted!</p>
                  <p className="text-sm text-slate-500 mt-1">Our team will get back to you within 24 hours.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Category</label>
                    <select
                      value={ticketForm.category}
                      onChange={e => setTicketForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      {["Billing", "Technical Issue", "Account", "Widget", "Other"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Subject</label>
                    <input
                      value={ticketForm.subject}
                      onChange={e => setTicketForm(p => ({ ...p, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Message</label>
                    <textarea
                      value={ticketForm.message}
                      onChange={e => setTicketForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Describe your issue in detail..."
                      rows={4}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setTicketOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">Cancel</button>
                    <button onClick={handleSubmitTicket} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 cursor-pointer">Submit Ticket</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      <Card title="Help Center — FAQs" subtitle="Common questions and answers" icon={<HelpCircle className="w-4 h-4" />}>
        <div className="space-y-3">
          {[
            { q: "How do I upgrade my subscription plan?", a: "Go to Billing > Subscription Plan and click 'Switch Plan' next to the plan you'd like to upgrade to." },
            { q: "How do I install the live chat widget on my website?", a: "Navigate to Chat History > Widget Integration and copy the embed code snippet into your website's <body> tag." },
            { q: "Can I export my chat transcripts?", a: "Yes! In the Chat History tab, click the download icon next to any resolved conversation to download the transcript as a PDF." },
            { q: "How do I add or remove agents from my account?", a: "Go to Settings > Team Members to invite new agents or adjust existing agent roles and permissions." },
            { q: "What happens if my payment fails?", a: "You'll receive an email notification and a 7-day grace period to update your payment method before your account is suspended." },
          ].map((item, i) => (
            <details key={i} className="group border border-slate-200 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors list-none">
                <span className="text-sm font-semibold text-slate-800">{item.q}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
              </summary>
              <div className="px-4 pb-4 pt-1">
                <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadNotifs = NOTIFICATIONS.filter(n => !n.read).length;

  const PAGE_TITLES: Record<string, string> = {
    overview: "Dashboard",
    chats: "Chat History",
    billing: "Billing & Payments",
    settings: "Account Settings",
    support: "Support & Notifications",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} bg-white border-r border-slate-200 flex flex-col fixed h-full z-20 transition-all duration-300 shadow-sm`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-slate-100 overflow-hidden">
          {sidebarOpen ? (
            <img src={jafChatraLogo} alt="JAF Live Chat" style={{ height: "90px", width: "auto" }} className="ml-3 shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center shrink-0 mx-auto">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4 rotate-180" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-y-auto">
          {sidebarOpen && <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Account</p>}
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`flex items-center ${sidebarOpen ? "px-3 gap-3" : "justify-center px-0"} py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === item.id
                  ? "bg-sky-50 text-sky-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <span className={activeTab === item.id ? "text-sky-600" : ""}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Account info at bottom */}
        {sidebarOpen && (
          <div className="p-3 border-t border-slate-100">
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
              <ImageWithFallback src={ACCOUNT.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{ACCOUNT.name}</p>
                <p className="text-xs text-slate-400 truncate">Pro Plan</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-16"}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors lg:hidden cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">{PAGE_TITLES[activeTab]}</h1>
              <p className="text-xs text-slate-400">Welcome back, {ACCOUNT.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">Notifications</p>
                    <span className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full font-semibold">{unreadNotifs} new</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {NOTIFICATIONS.slice(0, 4).map(n => (
                      <div key={n.id} className={`px-4 py-3 ${!n.read ? "bg-sky-50/50" : ""}`}>
                        <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.desc}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-slate-100">
                    <button onClick={() => { setNotifOpen(false); setActiveTab("support"); }} className="text-xs text-sky-600 font-semibold hover:text-sky-800 w-full text-center cursor-pointer">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ImageWithFallback src={ACCOUNT.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                <span className="text-xs font-semibold text-slate-700 hidden sm:block">{ACCOUNT.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{ACCOUNT.name}</p>
                    <p className="text-xs text-slate-500">{ACCOUNT.email}</p>
                    <span className="mt-1.5 inline-block text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-semibold">Pro Plan</span>
                  </div>
                  <div className="py-1">
                    {[
                      { label: "Account Settings", icon: <Settings className="w-4 h-4" />, tab: "settings" },
                      { label: "Billing", icon: <CreditCard className="w-4 h-4" />, tab: "billing" },
                      { label: "Support", icon: <HeadphonesIcon className="w-4 h-4" />, tab: "support" },
                    ].map(item => (
                      <button
                        key={item.label}
                        onClick={() => { setActiveTab(item.tab); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span className="text-slate-400">{item.icon}</span> {item.label}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1">
                      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto" onClick={() => { setProfileOpen(false); setNotifOpen(false); }}>
          {activeTab === "overview" && <OverviewView setActiveTab={setActiveTab} />}
          {activeTab === "chats" && <ChatHistoryView />}
          {activeTab === "billing" && <BillingView setActiveTab={setActiveTab} />}
          {activeTab === "settings" && <SettingsView />}
          {activeTab === "support" && <SupportView />}
        </main>
      </div>
    </div>
  );
}
