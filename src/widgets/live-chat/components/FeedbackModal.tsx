import { Star } from "lucide-react";

type FeedbackModalProps = {
  isOpen: boolean;
  themeModalBackdrop: string;
  themeModalCard: string;
  themeInput: string;
  themeSettingsMuted: string;
  themeModalSecondary: string;
  themeModalPrimary: string;
  feedbackComment: string;
  feedbackRating: number;
  feedbackMessage: string;
  isFeedbackSubmitting: boolean;
  onCommentChange: (value: string) => void;
  onRatingChange: (value: number) => void;
  onSkip: () => void;
  onSubmit: () => void;
};

const FeedbackModal = ({
  isOpen,
  themeModalBackdrop,
  themeModalCard,
  themeInput,
  themeSettingsMuted,
  themeModalSecondary,
  themeModalPrimary,
  feedbackComment,
  feedbackRating,
  feedbackMessage,
  isFeedbackSubmitting,
  onCommentChange,
  onRatingChange,
  onSkip,
  onSubmit,
}: FeedbackModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={`absolute inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-[5px] ${themeModalBackdrop}`}>
      <div className={`w-full max-w-[340px] rounded-3xl p-5 ${themeModalCard}`}>
        <div className="mb-3 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Star className="h-6 w-6 text-amber-500" />
          </div>
        </div>

        <h3 className="text-center text-xl font-semibold">Rate your chat</h3>
        <p className={`mt-2 text-center text-sm ${themeSettingsMuted}`}>
          Your feedback helps improve support quality. Comment is optional.
        </p>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          {Array.from({ length: 5 }).map((_, index) => {
            const ratingValue = index + 1;
            const isActive = ratingValue <= feedbackRating;

            return (
              <button
                key={ratingValue}
                type="button"
                onClick={() => onRatingChange(ratingValue)}
                className="transition-transform hover:-translate-y-0.5"
                aria-label={`${ratingValue} star${ratingValue === 1 ? "" : "s"}`}
              >
                <Star className={`h-8 w-8 ${isActive ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
              </button>
            );
          })}
        </div>

        <textarea
          value={feedbackComment}
          onChange={(event) => onCommentChange(event.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Add an optional comment"
          className={`mt-4 w-full rounded-2xl border px-3.5 py-2.5 text-sm outline-none ${themeInput}`}
        />

        {feedbackMessage ? <p className="mt-2 text-xs text-red-500">{feedbackMessage}</p> : null}

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onSkip}
            className={`h-11 rounded-2xl text-base font-semibold transition-colors ${themeModalSecondary}`}
            disabled={isFeedbackSubmitting}
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isFeedbackSubmitting || feedbackRating < 1}
            className={`h-11 rounded-2xl text-base font-semibold transition-colors ${themeModalPrimary}`}
          >
            {isFeedbackSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
