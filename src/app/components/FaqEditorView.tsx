import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  HelpCircle,
  Eye,
  PencilLine,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

// ── Storage key (shared with HomepageFaqSection) ──────────────────────────────

export const FAQ_STORAGE_KEY = "jaf_homepage_faqs";

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    q: "What is JAF Chatra and how does it work?",
    a: "JAF Chatra is a real-time live chat platform that lets you connect with your website visitors instantly. Simply add our lightweight widget to your site, and your support agents can start chatting with customers from the admin dashboard.",
  },
  {
    id: "faq-2",
    q: "How do I install the chat widget on my website?",
    a: "You can install JAF Chatra by copying a small JavaScript snippet into your website's HTML, or by using one of our integrations for WordPress, Shopify, Wix, and other popular platforms.",
  },
  {
    id: "faq-3",
    q: "Can I customize the appearance of the chat widget?",
    a: "Yes! You can fully customize the widget's colors, position, welcome messages, and branding from the Widget Settings page in your dashboard.",
  },
  {
    id: "faq-4",
    q: "What's the difference between the Free, Pro, and Enterprise plans?",
    a: "The Free plan includes 1 agent and basic chat features. Pro adds unlimited agents, analytics, chat history, and priority support. Enterprise includes everything in Pro plus SSO, custom integrations, and SLA guarantees.",
  },
  {
    id: "faq-5",
    q: "Is my data secure with JAF Chatra?",
    a: "Absolutely. We use end-to-end encryption for all chat communications, and our infrastructure is SOC 2 Type II compliant.",
  },
  {
    id: "faq-6",
    q: "Do you offer a free trial?",
    a: "Yes! We offer a 14-day free trial of the Pro plan with no credit card required. You can explore all premium features before deciding on a plan.",
  },
];

// ── Load / save helpers ───────────────────────────────────────────────────────

export function loadFaqs(): FaqItem[] {
  try {
    const stored = localStorage.getItem(FAQ_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as FaqItem[];
  } catch { /* ignore */ }
  return DEFAULT_FAQS;
}

function saveFaqs(faqs: FaqItem[]) {
  try {
    localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(faqs));
    window.dispatchEvent(new Event("jaf_faqs_updated"));
  } catch { /* ignore */ }
}

// ── Empty FAQ factory ─────────────────────────────────────────────────────────

function newFaq(): FaqItem {
  return { id: `faq-${Date.now()}`, q: "", a: "" };
}

// ── Inline editor for a single FAQ ────────────────────────────────────────────

interface FaqRowProps {
  faq: FaqItem;
  index: number;
  total: number;
  onUpdate: (updated: FaqItem) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function FaqRow({ faq, index, total, onUpdate, onDelete, onMoveUp, onMoveDown }: FaqRowProps) {
  const [expanded, setExpanded] = useState(faq.q === "");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm"
    >
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
        {/* Drag handle (visual only) */}
        <GripVertical className="w-4 h-4 text-gray-300 dark:text-slate-600 shrink-0 cursor-grab" />

        {/* Index badge */}
        <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
          {index + 1}
        </span>

        {/* Question preview / title */}
        <button
          className="flex-1 text-left text-sm font-medium text-gray-800 dark:text-slate-200 truncate"
          onClick={() => setExpanded((v) => !v)}
        >
          {faq.q || <span className="text-gray-400 dark:text-slate-500 italic">New question…</span>}
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move up"
            className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Move down"
            className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Collapse" : "Edit"}
            className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
          >
            <PencilLine className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="p-4 flex flex-col gap-3">
              {/* Question */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Question
                </label>
                <input
                  type="text"
                  value={faq.q}
                  onChange={(e) => onUpdate({ ...faq, q: e.target.value })}
                  placeholder="Enter the question…"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                />
              </div>
              {/* Answer */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Answer
                </label>
                <textarea
                  value={faq.a}
                  onChange={(e) => onUpdate({ ...faq, a: e.target.value })}
                  placeholder="Enter the answer…"
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition resize-y"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Live Preview Panel ────────────────────────────────────────────────────────

function PreviewPanel({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {faqs.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-slate-500 italic text-center py-8">
          No FAQs to preview yet.
        </p>
      )}
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm"
        >
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors"
            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
          >
            <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              {faq.q || <span className="text-gray-400 italic">No question set</span>}
            </span>
            <span className="shrink-0">
              {openId === faq.id
                ? <ChevronUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              }
            </span>
          </button>
          <AnimatePresence initial={false}>
            {openId === faq.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <p className="px-5 pb-4 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                  {faq.a || <span className="italic">No answer set</span>}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────

export function FaqEditorView() {
  const [faqs, setFaqs] = useState<FaqItem[]>(loadFaqs);
  const [saved, setSaved] = useState(false);
  const [activeView, setActiveView] = useState<"editor" | "preview">("editor");

  // Auto-save whenever faqs change
  useEffect(() => {
    saveFaqs(faqs);
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [faqs]);

  const addFaq = () => {
    setFaqs((prev) => [...prev, newFaq()]);
  };

  const updateFaq = (id: string, updated: FaqItem) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? updated : f)));
  };

  const deleteFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFaqs((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const moveDown = (index: number) => {
    setFaqs((prev) => {
      if (index === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  const resetToDefaults = () => {
    if (window.confirm("Reset all FAQs to defaults? This cannot be undone.")) {
      setFaqs(DEFAULT_FAQS);
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              {faqs.length} FAQ{faqs.length !== 1 ? "s" : ""} on the Homepage
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Changes save instantly to localStorage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-save indicator */}
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full"
              >
                <Save className="w-3.5 h-3.5" />
                Saved
              </motion.span>
            )}
          </AnimatePresence>

          {/* View toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setActiveView("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeView === "editor"
                  ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
              }`}
            >
              <PencilLine className="w-3.5 h-3.5" />
              Editor
            </button>
            <button
              onClick={() => setActiveView("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeView === "preview"
                  ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>

          <button
            onClick={resetToDefaults}
            title="Reset to defaults"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            onClick={addFaq}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {activeView === "editor" ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-3"
          >
            {faqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl text-center gap-3">
                <HelpCircle className="w-10 h-10 text-gray-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">No FAQs yet</p>
                <button
                  onClick={addFaq}
                  className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add your first FAQ
                </button>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {faqs.map((faq, i) => (
                  <FaqRow
                    key={faq.id}
                    faq={faq}
                    index={i}
                    total={faqs.length}
                    onUpdate={(updated) => updateFaq(faq.id, updated)}
                    onDelete={() => deleteFaq(faq.id)}
                    onMoveUp={() => moveUp(i)}
                    onMoveDown={() => moveDown(i)}
                  />
                ))}
              </AnimatePresence>
            )}

            {faqs.length > 0 && (
              <button
                onClick={addFaq}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-sm text-gray-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add another FAQ
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {/* Preview header */}
            <div className="mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Homepage preview — this is how visitors will see your FAQs
              </p>
            </div>

            {/* Simulated homepage FAQ section */}
            <div className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-8">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Everything you need to know about JAF Chatra
                  </p>
                </div>
                <PreviewPanel faqs={faqs} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
