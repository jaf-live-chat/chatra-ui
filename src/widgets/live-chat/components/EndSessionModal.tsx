import { AlertCircle, X } from "lucide-react";

type EndSessionModalProps = {
  isOpen: boolean;
  hasActiveConversation: boolean;
  onClose: () => void;
  onEndChat: () => void;
  onEndSession: () => void;
};

const EndSessionModal = ({
  isOpen,
  hasActiveConversation,
  onClose,
  onEndChat,
  onEndSession,
}: EndSessionModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[5px]">
      <div className="w-full max-w-[312px] rounded-[28px] bg-white px-5 pb-6 pt-5 shadow-[0_28px_54px_-34px_rgba(15,23,42,0.5)]">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-400"
            aria-label="Close end session prompt"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="-mt-0.5 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-500" strokeWidth={2.2} />
          </div>
        </div>

        <h6 className="mt-4 text-center text-[26px] font-semibold leading-tight tracking-[-0.01em] text-slate-700 sm:text-[24px]">
          End Session?
        </h6>
        <p className="mt-2.5 text-center text-[11px] font-normal leading-5 text-slate-500 sm:text-[12px]">
          Choose how you'd like to end this visit.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          {hasActiveConversation ? (
            <button
              type="button"
              onClick={onEndChat}
              className="h-11 rounded-2xl text-[14px] font-semibold text-white shadow-[0_16px_24px_-18px_rgba(8,145,178,0.9)] transition-colors hover:bg-cyan-700 sm:text-[13px]"
              style={{ backgroundColor: "#0f8da0" }}
            >
              Just end chat
            </button>
          ) : null}

          <button
            type="button"
            onClick={onEndSession}
            className="h-11 rounded-2xl bg-[#ef4444] text-[14px] font-semibold text-white shadow-[0_16px_24px_-18px_rgba(239,68,68,0.9)] transition-colors hover:bg-[#dc2626] sm:text-[13px]"
          >
            Sign out &amp; clear data
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndSessionModal;
