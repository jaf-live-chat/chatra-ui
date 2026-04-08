import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Save, MessageCircle, PencilLine } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import PageTitle from "../../components/common/PageTitle";
import TitleTag from "../../components/TitleTag";
import quickMessageServices, { useGetQuickMessages } from "../../services/quickMessageServices";
import type { QuickMessageRecord } from "../../models/QuickMessageModel";

type QuickMessageItem = {
  id: string;
  title: string;
  response: string;
};

const DRAFT_PREFIX = "draft-";

const isDraft = (id: string) => id.startsWith(DRAFT_PREFIX);

const mapQuickMessage = (item: QuickMessageRecord): QuickMessageItem => ({
  id: item._id,
  title: item.title,
  response: item.response,
});

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

function DeleteConfirmModal({
  title,
  onConfirm,
  onCancel,
  isLoading,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-slate-100">Delete Quick Message</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete "{title || "this quick message"}"?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EditorRow({
  item,
  index,
  expanded,
  isPersisting,
  onToggleExpand,
  onUpdate,
  onSave,
  onDelete,
}: {
  item: QuickMessageItem;
  index: number;
  expanded: boolean;
  isPersisting: boolean;
  onToggleExpand: () => void;
  onUpdate: (updated: QuickMessageItem) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
        <span className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
          {index + 1}
        </span>

        <button
          type="button"
          onClick={onToggleExpand}
          className="flex-1 text-left text-sm font-semibold text-gray-800 dark:text-slate-200 truncate"
        >
          {item.title || <span className="text-gray-400 dark:text-slate-500 italic">New title...</span>}
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSave}
            title="Save"
            className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleExpand}
            title={expanded ? "Collapse" : "Edit"}
            className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
          >
            <PencilLine className="w-4 h-4" />
          </button>
          <button
            type="button"
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
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="p-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(event) => onUpdate({ ...item, title: event.target.value })}
                  placeholder="Enter the title..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Response
                </label>
                <textarea
                  value={item.response}
                  onChange={(event) => onUpdate({ ...item, response: event.target.value })}
                  placeholder="Enter the response..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-y"
                />
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

const QuickMessagesView = () => {
  const { quickMessages: apiQuickMessages, isLoading, mutate } = useGetQuickMessages();

  const [items, setItems] = useState<QuickMessageItem[]>([]);
  const [saved, setSaved] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [persistingById, setPersistingById] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuickMessageItem | null>(null);

  useEffect(() => {
    setItems((apiQuickMessages || []).map(mapQuickMessage));
  }, [apiQuickMessages]);

  const showSavedState = useCallback(() => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }, []);

  const updateItem = (id: string, updated: QuickMessageItem) => {
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const persistItem = useCallback(
    async (id: string) => {
      const target = items.find((item) => item.id === id);

      if (!target) {
        return;
      }

      const title = target.title.trim();
      const response = target.response.trim();

      if (!title || !response) {
        toast.error("Title and response are required.");
        return;
      }

      try {
        setPersistingById((prev) => ({ ...prev, [id]: true }));

        if (isDraft(id)) {
          const created = await quickMessageServices.createQuickMessage({ title, response });
          if (!created.quickMessage) {
            throw new Error("Failed to create quick message.");
          }
          setExpandedId(created.quickMessage._id);
          toast.success("Quick message created successfully.");
        } else {
          await quickMessageServices.updateQuickMessage(id, { title, response });
          toast.success("Quick message updated successfully.");
        }

        showSavedState();
        await mutate();
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to save quick message."));
      } finally {
        setPersistingById((prev) => ({ ...prev, [id]: false }));
      }
    },
    [items, mutate, showSavedState]
  );

  const addItem = () => {
    const draftId = `${DRAFT_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((prev) => [{ id: draftId, title: "", response: "" }, ...prev]);
    setExpandedId(draftId);
  };

  const deleteItem = async (id: string) => {
    if (isDraft(id)) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setExpandedId((prev) => (prev === id ? null : prev));
      setDeleteTarget(null);
      return;
    }

    try {
      setIsBusy(true);
      await quickMessageServices.deleteQuickMessage(id);
      toast.success("Quick message deleted successfully.");
      showSavedState();
      setDeleteTarget(null);
      await mutate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete quick message."));
    } finally {
      setIsBusy(false);
    }
  };

  const sortedItems = useMemo(() => items, [items]);

  return (
    <>
      <PageTitle
        title="Quick Messages Editor"
        description="Create and manage reusable support quick messages."
        canonical="/portal/quick-messages"
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TitleTag
            title="Quick Messages Editor"
            subtitle="Create and manage reusable support quick messages."
            icon={<MessageCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
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

            <button
              type="button"
              onClick={addItem}
              disabled={isBusy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition-colors shadow-sm disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              Add Quick Message
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col gap-3"
        >
          {isLoading ? (
            <div className="py-10 text-center text-sm text-gray-500 dark:text-slate-400">Loading quick messages...</div>
          ) : sortedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl text-center gap-3">
              <MessageCircle className="w-10 h-10 text-gray-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">No quick messages yet</p>
              <button
                type="button"
                onClick={addItem}
                className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add your first quick message
              </button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {sortedItems.map((item, index) => (
                <EditorRow
                  key={item.id}
                  item={item}
                  index={index}
                  expanded={expandedId === item.id}
                  isPersisting={Boolean(persistingById[item.id])}
                  onToggleExpand={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
                  onUpdate={(updated) => updateItem(item.id, updated)}
                  onSave={() => {
                    void persistItem(item.id);
                  }}
                  onDelete={() => setDeleteTarget(item)}
                />
              ))}
            </AnimatePresence>
          )}

          {sortedItems.length > 0 && (
            <button
              type="button"
              onClick={addItem}
              disabled={isBusy}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-sm text-gray-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              Add another quick message
            </button>
          )}
        </motion.div>
      </div>

      {deleteTarget && (
        <DeleteConfirmModal
          title={deleteTarget.title}
          isLoading={isBusy}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            void deleteItem(deleteTarget.id);
          }}
        />
      )}

    </>
  );
};

export default QuickMessagesView;
