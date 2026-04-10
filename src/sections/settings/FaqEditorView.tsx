import { useCallback, useEffect, useMemo, useState, type DragEvent } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  HelpCircle,
  Eye,
  PencilLine,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import PageTitle from "../../components/common/PageTitle";
import TitleTag from "../../components/TitleTag";
import Skeleton from "../../components/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/AlertDialog";
import {
  createFaq,
  deleteFaqById,
  reorderFaqs,
  updateFaqById,
  useGetFaqs,
} from "../../services/faqServices";
import type { FaqModel } from "../../models/FaqModel";

type FaqItem = {
  id: string;
  q: string;
  a: string;
  order: number;
};

const mapFaq = (faq: FaqModel): FaqItem => ({
  id: faq._id,
  q: faq.question,
  a: faq.answer,
  order: faq.order,
});

const DRAFT_FAQ_PREFIX = "draft-";

const isDraftFaq = (id: string) => id.startsWith(DRAFT_FAQ_PREFIX);

const normalizeFaqOrders = (list: FaqItem[]) =>
  list.map((faq, index) => ({ ...faq, order: index }));

const buildPreviewOrder = (
  list: FaqItem[],
  draggedId: string | null,
  targetIndex: number | null,
) => {
  if (!draggedId || targetIndex == null) {
    return list;
  }

  const currentIndex = list.findIndex((faq) => faq.id === draggedId);

  if (currentIndex < 0) {
    return list;
  }

  let insertionIndex = targetIndex;
  if (currentIndex < insertionIndex) {
    insertionIndex -= 1;
  }

  if (insertionIndex === currentIndex) {
    return list;
  }

  const next = [...list];
  const [movedFaq] = next.splice(currentIndex, 1);
  next.splice(insertionIndex, 0, movedFaq);
  return next;
};

interface FaqRowProps {
  faq: FaqItem;
  index: number;
  total: number;
  expanded: boolean;
  isPersisting: boolean;
  isDragging: boolean;
  canDrag: boolean;
  onToggleExpand: () => void;
  onUpdate: (updated: FaqItem) => void;
  onPersist: (id: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: (id: string, event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
}

type PendingAction =
  | { type: "delete"; id: string; question: string }
  | { type: "reset" }
  | null;

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
    if (maybeError.response?.data?.message) {
      return maybeError.response.data.message;
    }
    if (maybeError.message) {
      return maybeError.message;
    }
  }

  return fallbackMessage;
};

const normalizeSupportText = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?])/g, "$1")
    .trim();

function FaqRow({
  faq,
  index,
  expanded,
  isPersisting,
  isDragging,
  canDrag,
  onToggleExpand,
  onUpdate,
  onPersist,
  onDelete,
  onDragStart,
  onDragEnd,
}: FaqRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm transition-all ${isDragging
        ? "opacity-80 border-transparent dark:border-transparent ring-0 shadow-md scale-[1.005]"
        : "opacity-100"
        }`}
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
        <button
          type="button"
          draggable={canDrag}
          onDragStart={(event) => onDragStart(faq.id, event)}
          onDragEnd={onDragEnd}
          title={canDrag ? "Drag to reorder" : "Please wait"}
          className="shrink-0 p-0.5 rounded text-gray-300 dark:text-slate-600 disabled:cursor-not-allowed"
          disabled={!canDrag}
        >
          <GripVertical className={`w-4 h-4 ${canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed"}`} />
        </button>

        <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
          {index + 1}
        </span>

        <button
          draggable={canDrag}
          onDragStart={(event) => onDragStart(faq.id, event)}
          onDragEnd={onDragEnd}
          className={`flex-1 text-left text-sm font-medium text-gray-800 dark:text-slate-200 truncate ${canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
          onClick={onToggleExpand}
        >
          {faq.q || <span className="text-gray-400 dark:text-slate-500 italic">New question...</span>}
        </button>

        <div className="flex items-center gap-1 shrink-0">


          <button
            onClick={() => onPersist(faq.id)}
            title="Save"
            className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleExpand}
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
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Question
                </label>
                <input
                  type="text"
                  value={faq.q}
                  onChange={(e) => onUpdate({ ...faq, q: e.target.value })}
                  placeholder="Enter the question..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Answer
                </label>
                <textarea
                  value={faq.a}
                  onChange={(e) => onUpdate({ ...faq, a: e.target.value })}
                  placeholder="Enter the answer..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition resize-y"
                />
                <p className="text-[11px] text-gray-400 dark:text-slate-500">
                  Keep answers brief, clear, and include a concrete next step.
                </p>
              </div>

              {isPersisting && (
                <span className="text-xs text-cyan-600 dark:text-cyan-400">Saving...</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

type DropZoneProps = {
  isActive: boolean;
  onDragEnter: () => void;
  onDrop: () => void;
};

function DropZone({ isActive, onDragEnter, onDrop }: DropZoneProps) {
  return (
    <div
      className="h-0 relative"
      aria-hidden="true"
    >
      <div
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDragEnter={onDragEnter}
        onDrop={(event) => {
          event.preventDefault();
          onDrop();
        }}
        className="absolute left-0 right-0 -top-3 h-6 cursor-pointer"
      />
      <div
        className={`absolute left-0 right-0 -top-[6px] h-[2px] rounded-full transition-all ${isActive ? "bg-cyan-400/90 dark:bg-cyan-500/90" : "bg-transparent"
          }`}
      />
    </div>
  );
}

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
            className="w-full flex items-center justify-between px-5 py-4 text-left gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
          >
            <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              {faq.q || <span className="text-gray-400 italic">No question set</span>}
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

const FaqEditorView = () => {
  const { faqs: apiFaqs, isLoading, mutate } = useGetFaqs();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [saved, setSaved] = useState(false);
  const [activeView, setActiveView] = useState<"editor" | "preview">("editor");
  const [isBusy, setIsBusy] = useState(false);
  const [persistingById, setPersistingById] = useState<Record<string, boolean>>({});
  const [draggedFaqId, setDraggedFaqId] = useState<string | null>(null);
  const [dragInsertIndex, setDragInsertIndex] = useState<number | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const mappedFaqs = (apiFaqs || []).map(mapFaq).sort((a, b) => a.order - b.order);
    setFaqs(mappedFaqs);
  }, [apiFaqs]);

  const showSavedState = useCallback(() => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }, []);

  const updateFaq = (id: string, updated: FaqItem) => {
    setFaqs((prev) => prev.map((faq) => (faq.id === id ? updated : faq)));
  };

  const persistFaq = useCallback(
    async (id: string) => {
      const targetFaq = faqs.find((faq) => faq.id === id);

      if (!targetFaq) {
        return;
      }

      const question = normalizeSupportText(targetFaq.q);
      const answer = normalizeSupportText(targetFaq.a);

      if (!question || !answer) {
        return;
      }

      try {
        setPersistingById((prev) => ({ ...prev, [id]: true }));
        setFaqs((prev) =>
          prev.map((faq) =>
            faq.id === id
              ? {
                ...faq,
                q: question,
                a: answer,
              }
              : faq
          )
        );

        if (isDraftFaq(id)) {
          const response = await createFaq({
            question,
            answer,
            order: targetFaq.order,
          });

          if (!response.faq) {
            throw new Error("Failed to create FAQ.");
          }

          const createdFaq = mapFaq(response.faq);

          setExpandedFaqId(createdFaq.id);
          toast.success("FAQ created successfully.");
        } else {
          await updateFaqById(id, {
            question,
            answer,
            order: targetFaq.order,
          });
          toast.success("FAQ updated successfully.");
        }

        showSavedState();
        await mutate();
      } catch (error) {
        const message = getErrorMessage(error, "Failed to save FAQ.");
        toast.error(message);
        console.error("Failed to save FAQ:", error);
      } finally {
        setPersistingById((prev) => ({ ...prev, [id]: false }));
      }
    },
    [faqs, mutate, showSavedState]
  );

  const persistOrder = useCallback(
    async (nextFaqs: FaqItem[]) => {
      const reordered = normalizeFaqOrders(nextFaqs);
      setFaqs(reordered);

      const persistedIds = reordered.filter((faq) => !isDraftFaq(faq.id)).map((faq) => faq.id);

      if (persistedIds.length === 0) {
        return;
      }

      try {
        setIsBusy(true);
        await reorderFaqs({ ids: persistedIds });
        showSavedState();
        toast.success("FAQ order updated.");
        await mutate();
      } catch (error) {
        const message = getErrorMessage(error, "Failed to reorder FAQs.");
        toast.error(message);
        console.error("Failed to reorder FAQs:", error);
      } finally {
        setIsBusy(false);
      }
    },
    [mutate, showSavedState]
  );

  const addFaq = async () => {
    const draftId = `${DRAFT_FAQ_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setFaqs((prev) => {
      const current = [...prev].sort((a, b) => a.order - b.order);
      return normalizeFaqOrders([
        { id: draftId, q: "", a: "", order: 0 },
        ...current,
      ]);
    });
    setExpandedFaqId(draftId);
    setActiveView("editor");
  };

  const deleteFaq = async (id: string) => {
    if (isDraftFaq(id)) {
      setFaqs((prev) => normalizeFaqOrders(prev.filter((faq) => faq.id !== id)));
      setExpandedFaqId((prev) => (prev === id ? null : prev));
      toast.success("Draft FAQ removed.");
      return;
    }

    try {
      setIsBusy(true);
      await deleteFaqById(id);
      showSavedState();
      toast.success("FAQ deleted successfully.");
      await mutate();
    } catch (error) {
      const message = getErrorMessage(error, "Failed to delete FAQ.");
      toast.error(message);
      console.error("Failed to delete FAQ:", error);
    } finally {
      setIsBusy(false);
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;

    const arr = [...faqs];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    await persistOrder(arr);
  };

  const moveDown = async (index: number) => {
    if (index === faqs.length - 1) return;

    const arr = [...faqs];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    await persistOrder(arr);
  };

  const resetToDefaults = async () => {
    const persistedFaqs = faqs.filter((faq) => !isDraftFaq(faq.id));

    try {
      setIsBusy(true);

      await Promise.all(persistedFaqs.map((faq) => deleteFaqById(faq.id)));

      setFaqs([]);
      setExpandedFaqId(null);

      showSavedState();
      toast.success("FAQs reset to defaults.");
      await mutate();
    } catch (error) {
      const message = getErrorMessage(error, "Failed to reset FAQs.");
      toast.error(message);
      console.error("Failed to reset FAQs:", error);
    } finally {
      setIsBusy(false);
    }
  };

  const requestDeleteConfirmation = (faqId: string, question: string) => {
    setPendingAction({ type: "delete", id: faqId, question });
    setIsConfirmOpen(true);
  };

  const requestResetConfirmation = () => {
    setPendingAction({ type: "reset" });
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) {
      return;
    }

    setIsConfirmOpen(false);

    if (pendingAction.type === "delete") {
      await deleteFaq(pendingAction.id);
      setPendingAction(null);
      return;
    }

    await resetToDefaults();
    setPendingAction(null);
  };

  const sortedFaqs = useMemo(() => [...faqs].sort((a, b) => a.order - b.order), [faqs]);

  const handleDragStart = (id: string) => {
    if (isBusy) {
      return;
    }

    setDraggedFaqId(id);
    const currentIndex = sortedFaqs.findIndex((faq) => faq.id === id);
    setDragInsertIndex(currentIndex >= 0 ? currentIndex : null);
  };

  const handleDragStartWithEvent = (id: string, event: DragEvent<HTMLButtonElement>) => {
    handleDragStart(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  };

  const handleDragEnd = () => {
    setDraggedFaqId(null);
    setDragInsertIndex(null);
  };

  const handleDropAtIndex = async (targetIndex: number) => {
    if (!draggedFaqId || isBusy) {
      handleDragEnd();
      return;
    }

    const next = buildPreviewOrder(sortedFaqs, draggedFaqId, targetIndex);

    if (next === sortedFaqs) {
      handleDragEnd();
      return;
    }

    handleDragEnd();
    await persistOrder(next);
  };

  const handleDragOverRow = (event: DragEvent<HTMLDivElement>, index: number) => {
    if (!draggedFaqId) {
      return;
    }

    event.preventDefault();

    // Always target the upper position of the hovered FAQ row.
    const nextInsertIndex = index;

    if (dragInsertIndex !== nextInsertIndex) {
      setDragInsertIndex(nextInsertIndex);
    }
  };

  const draggedFaq = useMemo(
    () => sortedFaqs.find((faq) => faq.id === draggedFaqId) ?? null,
    [sortedFaqs, draggedFaqId]
  );

  return (
    <>
      <PageTitle
        title="FAQ Editor"
        description="Create and manage homepage frequently asked questions."
        canonical="/portal/homepage-faqs"
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TitleTag
            title="FAQ Editor"
            subtitle="Create and manage homepage frequently asked questions."
            icon={<HelpCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
          />


          <div className="flex items-center gap-2">
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

            <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setActiveView("editor")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeView === "editor"
                  ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                  }`}
              >
                <PencilLine className="w-3.5 h-3.5" />
                Editor
              </button>
              <button
                onClick={() => setActiveView("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeView === "preview"
                  ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                  }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
            </div>

            <button
              onClick={addFaq}
              disabled={isBusy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition-colors shadow-sm disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              Add FAQ
            </button>
          </div>
        </div>

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
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Skeleton className="h-7 w-7 rounded-full" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-5 w-20 ml-auto" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-11/12 mt-2" />
                    </div>
                  ))}
                </div>
              ) : sortedFaqs.length === 0 ? (
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
                  {sortedFaqs.map((faq, i) => (
                    <div
                      key={faq.id}
                      className="flex flex-col"
                      onDragOver={(event) => {
                        handleDragOverRow(event, i);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        void handleDropAtIndex(i);
                      }}
                    >
                      <DropZone
                        isActive={dragInsertIndex === i && Boolean(draggedFaqId)}
                        onDragEnter={() => {
                          if (draggedFaqId) {
                            setDragInsertIndex(i);
                          }
                        }}
                        onDrop={() => {
                          void handleDropAtIndex(i);
                        }}
                      />
                      <FaqRow
                        faq={faq}
                        index={i}
                        total={sortedFaqs.length}
                        expanded={expandedFaqId === faq.id}
                        isPersisting={Boolean(persistingById[faq.id])}
                        isDragging={draggedFaqId === faq.id}
                        canDrag={!isBusy && sortedFaqs.length > 1}
                        onToggleExpand={() => {
                          setExpandedFaqId((prev) => (prev === faq.id ? null : faq.id));
                        }}
                        onUpdate={(updated) => updateFaq(faq.id, updated)}
                        onPersist={(id) => {
                          void persistFaq(id);
                        }}
                        onDelete={() => {
                          requestDeleteConfirmation(faq.id, faq.q);
                        }}
                        onMoveUp={() => {
                          void moveUp(i);
                        }}
                        onMoveDown={() => {
                          void moveDown(i);
                        }}
                        onDragStart={handleDragStartWithEvent}
                        onDragEnd={handleDragEnd}
                      />
                    </div>
                  ))}
                  <DropZone
                    isActive={dragInsertIndex === sortedFaqs.length && Boolean(draggedFaqId)}
                    onDragEnter={() => {
                      if (draggedFaqId) {
                        setDragInsertIndex(sortedFaqs.length);
                      }
                    }}
                    onDrop={() => {
                      void handleDropAtIndex(sortedFaqs.length);
                    }}
                  />
                </AnimatePresence>
              )}

              {sortedFaqs.length > 0 && (
                <button
                  onClick={addFaq}
                  disabled={isBusy}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-sm text-gray-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors disabled:opacity-60"
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
              <div className="mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Homepage preview - this is how visitors will see your FAQs
                </p>
              </div>

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
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full mt-3" />
                          <Skeleton className="h-4 w-5/6 mt-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <PreviewPanel faqs={sortedFaqs} />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === "delete" ? "Delete FAQ?" : "Reset FAQs to defaults?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === "delete"
                ? `This will permanently remove "${pendingAction.question || "this FAQ"}".`
                : "This will delete all current FAQs and replace them with the default set."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleConfirmAction();
              }}
              disabled={isBusy}
            >
              {pendingAction?.type === "delete" ? "Delete" : "Reset"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FaqEditorView;
