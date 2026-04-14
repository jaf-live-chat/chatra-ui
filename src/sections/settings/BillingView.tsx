import { useState, useMemo } from "react";
import {
  CreditCard,
  Download,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  TrendingUp,
  Users,
  MessageSquare,
  ArrowUpRight,
  X,
  Plus,
  Trash2,
  Edit3,
  DollarSign,
  Globe,
  Shield,
  BarChart2,
  Calendar,
  RotateCcw,
  Zap,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

type PaymentStatus = "Paid" | "Pending" | "Overdue";

interface Invoice {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: PaymentStatus;
}

const invoicesData: Invoice[] = [
  { id: "INV-2026-032", customer: "New Trial Co", date: "Mar 13, 2026", amount: "$0.00", status: "Paid" },
  { id: "INV-2026-031", customer: "Acme Corp", date: "Mar 1, 2026", amount: "$149.00", status: "Paid" },
  { id: "INV-2026-030", customer: "Globex Inc", date: "Mar 1, 2026", amount: "$299.00", status: "Pending" },
  { id: "INV-2026-029", customer: "Initech LLC", date: "Feb 28, 2026", amount: "$149.00", status: "Overdue" },
  { id: "INV-2026-028", customer: "Umbrella Corp", date: "Feb 15, 2026", amount: "$599.00", status: "Paid" },
  { id: "INV-2026-027", customer: "Hooli Inc", date: "Feb 1, 2026", amount: "$149.00", status: "Paid" },
  { id: "INV-2026-026", customer: "Pied Piper", date: "Jan 20, 2026", amount: "$299.00", status: "Overdue" },
  { id: "INV-2026-025", customer: "Aviato Inc", date: "Jan 15, 2026", amount: "$149.00", status: "Paid" },
  { id: "INV-2026-024", customer: "Raviga Capital", date: "Jan 1, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-2026-023", customer: "Bachmanity", date: "Dec 22, 2025", amount: "$299.00", status: "Pending" },
  { id: "INV-2026-022", customer: "End Frame", date: "Dec 10, 2025", amount: "$149.00", status: "Paid" },
];

interface PendingPayment {
  id: string;
  customer: string;
  amount: string;
  dueDate: string;
  status: "Pending" | "Overdue";
  email: string;
}

const pendingPaymentsData: PendingPayment[] = [
  { id: "INV-2026-030", customer: "Globex Inc", amount: "$299.00", dueDate: "Mar 15, 2026", status: "Pending", email: "billing@globex.com" },
  { id: "INV-2026-029", customer: "Initech LLC", amount: "$149.00", dueDate: "Feb 28, 2026", status: "Overdue", email: "admin@initech.com" },
  { id: "INV-2026-026", customer: "Pied Piper", amount: "$299.00", dueDate: "Jan 20, 2026", status: "Overdue", email: "richard@piedpiper.com" },
  { id: "INV-2026-023", customer: "Bachmanity", amount: "$299.00", dueDate: "Jan 5, 2026", status: "Pending", email: "erlich@bachmanity.com" },
];

interface RefundRequest {
  id: string;
  customer: string;
  amount: string;
  requestDate: string;
  reason: string;
  status: "Pending Review" | "Approved" | "Rejected";
}

const refundRequestsData: RefundRequest[] = [
  { id: "REF-2026-008", customer: "Hooli Inc", amount: "$149.00", requestDate: "Mar 10, 2026", reason: "Duplicate charge", status: "Pending Review" },
  { id: "REF-2026-007", customer: "Aviato Inc", amount: "$49.00", requestDate: "Mar 5, 2026", reason: "Service downtime exceeding SLA", status: "Pending Review" },
  { id: "REF-2026-006", customer: "End Frame", amount: "$299.00", requestDate: "Feb 22, 2026", reason: "Cancelled plan mid-cycle", status: "Approved" },
];

const paymentMethods = [
  { id: 1, type: "Visa", last4: "4242", expiry: "12/27", isDefault: true },
  { id: 2, type: "PayPal", last4: "", expiry: "", email: "admin@jaflivechat.com", isDefault: false },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PaymentStatus | "Pending Review" | "Approved" | "Rejected" }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    Paid: { bg: "bg-green-50 text-green-700 border-green-200", text: "Paid", icon: <CheckCircle2 className="w-3 h-3" /> },
    Pending: { bg: "bg-yellow-50 text-yellow-700 border-yellow-200", text: "Pending", icon: <Clock className="w-3 h-3" /> },
    Overdue: { bg: "bg-red-50 text-red-700 border-red-200", text: "Overdue", icon: <AlertCircle className="w-3 h-3" /> },
    "Pending Review": { bg: "bg-yellow-50 text-yellow-700 border-yellow-200", text: "Pending Review", icon: <Clock className="w-3 h-3" /> },
    Approved: { bg: "bg-green-50 text-green-700 border-green-200", text: "Approved", icon: <CheckCircle2 className="w-3 h-3" /> },
    Rejected: { bg: "bg-red-50 text-red-700 border-red-200", text: "Rejected", icon: <X className="w-3 h-3" /> },
  };
  const c = config[status] || config.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg}`}>
      {c.icon} {c.text}
    </span>
  );
}

function SectionCard({ title, subtitle, icon, children }: { title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        {icon && <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">{icon}</div>}
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-fade-in-up overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Refund Modal ─────────────────────────────────────────────────────────────

function RefundModal({ open, onClose, refund, onApprove, onReject }: { open: boolean; onClose: () => void; refund: RefundRequest | null; onApprove: (id: string) => void; onReject: (id: string) => void }) {
  if (!refund) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Refund Request — ${refund.id}`}>
      <div className="space-y-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="font-medium text-slate-900">{refund.customer}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="font-bold text-slate-900">{refund.amount}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Request Date</span><span className="text-slate-700">{refund.requestDate}</span></div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 mb-1.5">Reason for Refund</p>
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-sm text-sky-800">{refund.reason}</div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 mb-1.5">Admin Note (optional)</p>
          <textarea
            className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            rows={3}
            placeholder="Add an internal note about this refund decision..."
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => { onReject(refund.id); onClose(); }} className="flex-1 px-4 py-2.5 border border-blue-200 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors cursor-pointer">
          Reject
        </button>
        <button onClick={() => { onApprove(refund.id); onClose(); }} className="flex-1 px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors cursor-pointer">
          Approve Refund
        </button>
      </div>
    </Modal>
  );
}

// ─── Generate Report Modal ────────────────────────────────────────────────────

function GenerateReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [period, setPeriod] = useState("monthly");
  const [month, setMonth] = useState("March 2026");
  const [format, setFormat] = useState("PDF");
  return (
    <Modal open={open} onClose={onClose} title="Generate Financial Report">
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Report Period</label>
          <div className="flex gap-2">
            {["monthly", "quarterly", "yearly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer capitalize ${
                  period === p ? "bg-sky-600 text-white border-sky-600" : "border-slate-200 text-slate-700 hover:border-sky-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Select Period</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            <option>March 2026</option>
            <option>February 2026</option>
            <option>January 2026</option>
            <option>Q1 2026</option>
            <option>Q4 2025</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Format</label>
          <div className="flex gap-2">
            {["PDF", "Excel", "CSV"].map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                  format === f ? "bg-sky-600 text-white border-sky-600" : "border-slate-200 text-slate-700 hover:border-sky-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
          Cancel
        </button>
        <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors cursor-pointer flex items-center justify-center gap-2">
          <BarChart2 className="w-4 h-4" /> Generate Report
        </button>
      </div>
    </Modal>
  );
}

// ─── Main BillingView ─────────────────────────────────────────────────────────

const BillingView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PaymentStatus>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const [pendingPayments, setPendingPayments] = useState(pendingPaymentsData);
  const [invoices, setInvoices] = useState(invoicesData);
  const [refunds, setRefunds] = useState(refundRequestsData);

  const [refundModal, setRefundModal] = useState<{ open: boolean; refund: RefundRequest | null }>({ open: false, refund: null });
  const [reportOpen, setReportOpen] = useState(false);

  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState("12");
  const [reminderSent, setReminderSent] = useState<Set<string>>(new Set());
  const [markedPaid, setMarkedPaid] = useState<Set<string>>(new Set());

  const [activeSettingsTab, setActiveSettingsTab] = useState<"payment" | "tax" | "currency">("payment");

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || inv.id.toLowerCase().includes(q) || inv.customer.toLowerCase().includes(q) || inv.date.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSendReminder = (id: string) => {
    setReminderSent((prev) => new Set([...prev, id]));
  };

  const handleMarkPaid = (id: string) => {
    setMarkedPaid((prev) => new Set([...prev, id]));
    setPendingPayments((prev) => prev.filter((p) => p.id !== id));
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "Paid" } : inv))
    );
  };

  const handleApproveRefund = (id: string) => {
    setRefunds((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" as const } : r)));
  };

  const handleRejectRefund = (id: string) => {
    setRefunds((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Rejected" as const } : r)));
  };

  const handleExportCSV = () => {
    const headers = ["Invoice Number", "Customer", "Date", "Amount", "Status"];
    const rows = invoices.map((inv) => [inv.id, inv.customer, inv.date, inv.amount, inv.status]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jaf-billing-export.csv";
    a.click();
  };

  const summaryStats = [
    { label: "Total Revenue", value: "$14,382", change: "+8.2%", icon: <DollarSign className="w-5 h-5" />, color: "text-sky-600", bg: "bg-sky-50" },
    { label: "Pending Amount", value: "$598", change: "4 invoices", icon: <Clock className="w-5 h-5" />, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Overdue Amount", value: "$448", change: "2 invoices", icon: <AlertCircle className="w-5 h-5" />, color: "text-red-700", bg: "bg-red-100" },
    { label: "Refund Requests", value: "3", change: "2 pending", icon: <RotateCcw className="w-5 h-5" />, color: "text-blue-700", bg: "bg-blue-100" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Payments</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage subscriptions, invoices, and financial settings.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-sky-300 transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-sky-600" /> Export CSV
          </button>
          <button
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-all cursor-pointer shadow-sm"
          >
            <BarChart2 className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-xs font-medium text-slate-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />{s.change}</p>
          </div>
        ))}
      </div>

      {/* ── Payment Management ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments */}
        <SectionCard title="Pending Payments" subtitle="Customers with unpaid or overdue invoices" icon={<AlertCircle className="w-4 h-4" />}>
          {pendingPayments.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-10 h-10 text-sky-400 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">All payments are up to date!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-xl border p-4 transition-all ${
                    markedPaid.has(p.id) ? "opacity-50 pointer-events-none" : p.status === "Overdue" ? "border-red-300 bg-red-100/50" : "border-yellow-200 bg-yellow-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{p.customer}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{p.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-900">{p.amount}</p>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Due: {p.dueDate}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSendReminder(p.id)}
                      disabled={reminderSent.has(p.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer disabled:cursor-default ${
                        reminderSent.has(p.id)
                          ? "border-slate-200 bg-slate-50 text-slate-400"
                          : "border-sky-200 text-sky-700 hover:bg-sky-50"
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {reminderSent.has(p.id) ? "Reminder Sent" : "Send Reminder"}
                    </button>
                    <button
                      onClick={() => handleMarkPaid(p.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-sky-600 text-white hover:bg-sky-700 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Paid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Refund Requests */}
        <SectionCard title="Refund Requests" subtitle="Review and manage customer refund requests" icon={<RotateCcw className="w-4 h-4" />}>
          {refunds.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-10 h-10 text-sky-400 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No active refund requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {refunds.map((r) => (
                <div key={r.id} className="rounded-xl border border-slate-200 p-4 hover:border-sky-200 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{r.customer}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{r.id} · {r.requestDate}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className="text-base font-bold text-slate-900">{r.amount}</span>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-3">
                    <span className="font-medium text-slate-700">Reason: </span>{r.reason}
                  </p>
                  {r.status === "Pending Review" && (
                    <button
                      onClick={() => setRefundModal({ open: true, refund: r })}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border border-sky-200 text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Review Request
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Billing History ── */}
      <SectionCard title="Billing History" subtitle="All invoices across customers" icon={<FileText className="w-4 h-4" />}>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by invoice #, customer, or date..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(["All", "Paid", "Pending", "Overdue"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setStatusFilter(f); setCurrentPage(1); }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  statusFilter === f ? "bg-sky-600 text-white border-sky-600" : "border-slate-200 text-slate-600 hover:border-sky-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Issued</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No invoices match your search.</td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-sky-50/40 transition-colors group">
                    <td className="px-5 py-4 font-medium text-slate-800 font-mono text-xs">{inv.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {inv.customer.charAt(0)}
                        </div>
                        <span className="text-slate-800">{inv.customer}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{inv.date}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{inv.amount}</td>
                    <td className="px-5 py-4">
                      {(() => {
                        const statusStyles: Record<string, { cls: string; icon: React.ReactNode }> = {
                          Paid:    { cls: "bg-green-50 text-green-700 border-green-200",   icon: <CheckCircle2 className="w-3 h-3" /> },
                          Pending: { cls: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: <Clock className="w-3 h-3" /> },
                          Overdue: { cls: "bg-red-50 text-red-700 border-red-200",         icon: <AlertCircle className="w-3 h-3" /> },
                        };
                        const s = statusStyles[inv.status] ?? statusStyles.Overdue;
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
                            {s.icon} {inv.status}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-800 text-xs font-medium hover:bg-sky-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-sky-200">
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
              <p className="text-xs text-slate-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)} of {filteredInvoices.length}
            </p>
              <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:border-sky-400 transition-colors cursor-pointer disabled:cursor-default"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 text-xs rounded-lg transition-colors cursor-pointer ${
                    currentPage === p ? "bg-sky-600 text-white" : "border border-slate-200 text-slate-600 hover:border-sky-400"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:border-sky-400 transition-colors cursor-pointer disabled:cursor-default"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── Billing Settings ── */}
      <SectionCard title="Billing Settings" subtitle="Manage payment methods, taxes, and currency" icon={<CreditCard className="w-4 h-4" />}>
        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
          {(["payment", "tax", "currency"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSettingsTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-all cursor-pointer -mb-px whitespace-nowrap ${
                activeSettingsTab === tab ? "border-sky-600 text-sky-700" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "payment" ? "Payment Methods" : tab === "tax" ? "Tax Settings" : "Currency"}
            </button>
          ))}
        </div>

        {/* Payment Methods */}
        {activeSettingsTab === "payment" && (
          <div className="space-y-3">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-slate-200 rounded-xl hover:border-sky-200 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold ${pm.type === "Visa" ? "bg-blue-600" : "bg-sky-500"}`}>
                    {pm.type === "Visa" ? "VISA" : "PP"}
                  </div>
                  <div className="min-w-0">
                    {pm.type === "Visa" ? (
                      <>
                        <p className="text-sm font-semibold text-slate-900">Visa ending in {pm.last4}</p>
                        <p className="text-xs text-slate-500">Expires {pm.expiry}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-900">PayPal</p>
                        <p className="text-xs text-slate-500">{pm.email}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {pm.isDefault && (
                    <span className="text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-full font-medium">Default</span>
                  )}
                  <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button className="flex items-center gap-2 text-sky-600 hover:text-sky-800 text-sm font-medium px-4 py-2.5 border-2 border-dashed border-sky-200 rounded-xl hover:border-sky-400 hover:bg-sky-50 w-full justify-center transition-all cursor-pointer mt-2">
              <Plus className="w-4 h-4" /> Add Payment Method
            </button>
          </div>
        )}

        {/* Tax Settings */}
        {activeSettingsTab === "tax" && (
          <div className="space-y-5 max-w-md">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Tax Rate (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-32 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  min="0"
                  max="100"
                  step="0.5"
                />
                <span className="text-slate-500 text-sm">%</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">This rate will be applied to all new invoices automatically.</p>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
              <p className="text-sm text-sky-800 font-medium mb-1">Tax ID / VAT Number</p>
              <input
                type="text"
                placeholder="e.g., PH-VAT-12345678"
                className="w-full border border-sky-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 mt-1"
              />
            </div>
            <button className="px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors cursor-pointer">
              Save Tax Settings
            </button>
          </div>
        )}

        {/* Currency Settings */}
        {activeSettingsTab === "currency" && (
          <div className="space-y-5 max-w-md">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Default Currency</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { code: "USD", symbol: "$", name: "US Dollar" },
                  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
                  { code: "EUR", symbol: "€", name: "Euro" },
                  { code: "GBP", symbol: "£", name: "British Pound" },
                  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
                  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
                ].map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      currency === c.code ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-sky-300"
                    }`}
                  >
                    <p className="text-base font-bold text-slate-900">{c.symbol}</p>
                    <p className="text-xs font-semibold text-slate-700">{c.code}</p>
                    <p className="text-xs text-slate-400">{c.name}</p>
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={() => alert(`Currency successfully saved to ${currency}!`)}
              className="px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors cursor-pointer"
            >
              Save Currency
            </button>
          </div>
        )}
      </SectionCard>

      {/* ─── Modals ─── */}
      <RefundModal
        open={refundModal.open}
        onClose={() => setRefundModal({ open: false, refund: null })}
        refund={refundModal.refund}
        onApprove={handleApproveRefund}
        onReject={handleRejectRefund}
      />
      <GenerateReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}

export default BillingView;


