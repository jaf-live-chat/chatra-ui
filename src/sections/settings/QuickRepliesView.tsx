import { useState, useEffect } from "react";
import {
  Plus,
  Copy,
  Check,
  Pencil,
  Trash2,
  X,
  Zap,
  Tag,
  MessageSquareText,
  ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuickReply {
  id: string;
  shortcut: string;   // e.g. /greeting
  title: string;
  message: string;
  category: string;
  createdAt: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

export const SEED_REPLIES: QuickReply[] = [
  {
    id: "qr-1",
    shortcut: "/greeting",
    title: "Welcome Greeting",
    message: "Hello! Thank you for reaching out to JAF Chatra support. My name is Sarah and I'll be happy to help you today. Could you please describe the issue you're experiencing?",
    category: "Greetings",
    createdAt: "2026-03-01",
  },
  {
    id: "qr-2",
    shortcut: "/bye",
    title: "Closing Message",
    message: "Thank you for contacting JAF Chatra support! I'm glad we could resolve your issue. Don't hesitate to reach out if you need anything else. Have a wonderful day! 😊",
    category: "Greetings",
    createdAt: "2026-03-01",
  },
  {
    id: "qr-3",
    shortcut: "/wait",
    title: "Ask to Wait",
    message: "I appreciate your patience. Let me look into this for you — please give me just a moment.",
    category: "General",
    createdAt: "2026-03-02",
  },
  {
    id: "qr-4",
    shortcut: "/transfer",
    title: "Transfer Notice",
    message: "I'm going to transfer you to a specialist who can best assist you with this. Please hold on for a moment while I connect you.",
    category: "General",
    createdAt: "2026-03-02",
  },
  {
    id: "qr-5",
    shortcut: "/refund",
    title: "Refund Policy",
    message: "We offer a 30-day money-back guarantee on all plans. To initiate a refund, please visit your Billing settings and click 'Request Refund', or I can process it for you right now — just confirm your account email.",
    category: "Billing",
    createdAt: "2026-03-05",
  },
  {
    id: "qr-6",
    shortcut: "/invoice",
    title: "Invoice Download",
    message: "You can download all your invoices from Dashboard → Billing → Invoice History. Each invoice has a 'Download PDF' button. If you need a specific invoice emailed, let me know!",
    category: "Billing",
    createdAt: "2026-03-05",
  },
  {
    id: "qr-7",
    shortcut: "/apikey",
    title: "Find API Key",
    message: "Your API key can be found under Settings → API & Integrations. Click 'Generate New Key' if you haven't created one yet. Remember to keep it secret and never share it publicly.",
    category: "Technical",
    createdAt: "2026-03-08",
  },
  {
    id: "qr-8",
    shortcut: "/reset",
    title: "Password Reset",
    message: "To reset your password, go to the Login page and click 'Forgot Password'. A reset link will be sent to your registered email within 2 minutes. Check your spam folder if you don't see it!",
    category: "Technical",
    createdAt: "2026-03-08",
  },
  {
    id: "qr-9",
    shortcut: "/upgrade",
    title: "Plan Upgrade Info",
    message: "Upgrading is easy! Head to Dashboard → Billing → Subscription Plans and click 'Upgrade'. Your new features activate instantly and you'll only be billed the pro-rated difference.",
    category: "Billing",
    createdAt: "2026-03-10",
  },
  {
    id: "qr-10",
    shortcut: "/sorry",
    title: "Apology Message",
    message: "I sincerely apologize for the inconvenience this has caused you. We take this seriously and I'll do everything I can to make this right for you right now.",
    category: "General",
    createdAt: "2026-03-12",
  },
];

const CATEGORIES = ["All", "Greetings", "General", "Billing", "Technical"];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Greetings: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  General:   { bg: "bg-blue-50 dark:bg-blue-900/20",   text: "text-blue-700 dark:text-blue-300",   border: "border-blue-200 dark:border-blue-800"   },
  Billing:   { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800"  },
  Technical: { bg: "bg-cyan-50 dark:bg-cyan-900/20",   text: "text-cyan-700 dark:text-cyan-300",   border: "border-cyan-200 dark:border-cyan-800"    },
};

// ─── Blank form ───────────────────────────────────────────────────────────────

const blankForm = (): Omit<QuickReply, "id" | "createdAt"> => ({
  shortcut: "",
  title: "",
  message: "",
  category: "General",
});

// ─── Small helpers ────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const c = CATEGORY_COLORS[category] ?? { bg: "bg-gray-100 dark:bg-slate-700", text: "text-gray-600 dark:text-slate-300", border: "border-gray-200 dark:border-slate-600" };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
      <Tag className="w-3 h-3" />
      {category}
    </span>
  );
}

function ShortcutBadge({ shortcut }: { shortcut: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
      <Zap className="w-3 h-3 text-cyan-500" />
      {shortcut}
    </span>
  );
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────

function ConfirmDeleteModal({ reply, onConfirm, onCancel }: { reply: QuickReply; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-slate-100">Delete Quick Reply</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-slate-100">"{reply.title}"</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

interface ReplyModalProps {
  editingReply: QuickReply | null;
  onSave: (data: Omit<QuickReply, "id" | "createdAt">) => void;
  onClose: () => void;
}

function ReplyModal({ editingReply, onSave, onClose }: ReplyModalProps) {
  const [form, setForm] = useState<Omit<QuickReply, "id" | "createdAt">>(
    editingReply
      ? { shortcut: editingReply.shortcut, title: editingReply.title, message: editingReply.message, category: editingReply.category }
      : blankForm()
  );
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [isCatOpen, setIsCatOpen] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.message.trim()) e.message = "Message is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    // Auto-generate shortcut from title
    const autoShortcut = "/" + form.title.trim().toLowerCase().replace(/\s+/g, "").slice(0, 20);
    onSave({ ...form, shortcut: form.shortcut || autoShortcut });
  };

  const field = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const availableCategories = CATEGORIES.filter((c) => c !== "All");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center">
              <MessageSquareText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-slate-100">
              {editingReply ? "Edit Quick Reply" : "New Quick Reply"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Title
            </label>
            <input
              value={form.title}
              onChange={(e) => field("title", e.target.value)}
              placeholder="e.g. Welcome Greeting"
              className={`w-full px-3 py-2.5 rounded-lg border ${errors.title ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-600"} bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-700 transition`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Shortcut + Category row */}
          <div className="flex gap-3">
            <div className="w-40">
              <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Category
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCatOpen(!isCatOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-sm text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-700 transition"
                >
                  {form.category}
                  <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500 ml-1" />
                </button>
                {isCatOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsCatOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1">
                      {availableCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => { field("category", cat); setIsCatOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Message
            </label>
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => field("message", e.target.value)}
              placeholder="Type the full message that will be sent when this shortcut is used…"
              className={`w-full px-3 py-2.5 rounded-lg border ${errors.message ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-600"} bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-700 transition resize-none`}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.message
                ? <p className="text-xs text-red-500">{errors.message}</p>
                : <span />
              }
              <p className="text-xs text-gray-400 dark:text-slate-500 ml-auto">{form.message.length} chars</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold transition-colors"
          >
            {editingReply ? "Save Changes" : "Add Quick Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "jaf_quick_replies";

const QuickRepliesView = () => {
  const [replies, setReplies] = useState<QuickReply[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* silently fail */ }
    return SEED_REPLIES;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReply, setEditingReply] = useState<QuickReply | null>(null);
  const [deletingReply, setDeletingReply] = useState<QuickReply | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Persist to localStorage whenever replies change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(replies));
    } catch { /* silently fail */ }
  }, [replies]);

  const handleSave = (data: Omit<QuickReply, "id" | "createdAt">) => {
    if (editingReply) {
      setReplies((prev) => prev.map((r) => r.id === editingReply.id ? { ...r, ...data } : r));
    } else {
      const newReply: QuickReply = {
        ...data,
        id: `qr-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setReplies((prev) => [newReply, ...prev]);
    }
    setIsModalOpen(false);
    setEditingReply(null);
  };

  const handleDelete = () => {
    if (!deletingReply) return;
    setReplies((prev) => prev.filter((r) => r.id !== deletingReply.id));
    setDeletingReply(null);
  };

  const openAdd = () => { setEditingReply(null); setIsModalOpen(true); };
  const openEdit = (r: QuickReply) => { setEditingReply(r); setIsModalOpen(true); };

  const handleCopy = (reply: QuickReply) => {
    navigator.clipboard.writeText(reply.message).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = reply.message;
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    });
    setCopiedId(reply.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Quick Replies</h1>
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm pl-12">
            Save and reuse common responses to resolve chats faster.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Quick Reply
        </button>
      </div>

      {/* ── Table ── */}
      {replies.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wide">Message</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {replies.map((reply) => (
                  <tr key={reply.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100 whitespace-nowrap">{reply.title}</td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={reply.category} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 max-w-xs truncate">{reply.message}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleCopy(reply)}
                          title="Copy message"
                          className={`p-1.5 rounded-lg transition-colors ${
                            copiedId === reply.id
                              ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                              : "text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-300"
                          }`}
                        >
                          {copiedId === reply.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEdit(reply)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingReply(reply)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center mb-4">
            <MessageSquareText className="w-8 h-8 text-gray-400 dark:text-slate-500" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-slate-100 mb-1">No quick replies yet</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs">
            Create your first quick reply to speed up your chat responses.
          </p>
          <button
            onClick={openAdd}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create First Quick Reply
          </button>
        </div>
      )}

      {/* ── Tip banner ── */}
      {replies.length > 0 && (
        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl border border-cyan-100 dark:border-cyan-900 bg-cyan-50 dark:bg-cyan-900/20">
          <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-sm text-cyan-800 dark:text-cyan-300">
            <span className="font-semibold">Pro tip:</span> During an active chat, type a shortcut (e.g. <span className="font-mono">/greeting</span>) to instantly paste the full reply into the message box.
          </p>
        </div>
      )}

      {/* ── Modals ── */}
      {isModalOpen && (
        <ReplyModal
          editingReply={editingReply}
          onSave={handleSave}
          onClose={() => { setIsModalOpen(false); setEditingReply(null); }}
        />
      )}
      {deletingReply && (
        <ConfirmDeleteModal
          reply={deletingReply}
          onConfirm={handleDelete}
          onCancel={() => setDeletingReply(null)}
        />
      )}
    </div>
  );
}

export default QuickRepliesView;


