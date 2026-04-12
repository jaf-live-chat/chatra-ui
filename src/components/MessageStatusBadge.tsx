import { Check } from "lucide-react";

export type MessageStatusType = "SENDING" | "DELIVERED" | "SEEN";

interface MessageStatusBadgeProps {
  status?: MessageStatusType;
  seenByRole?: string | null;
}

/**
 * Displays message status indicator (Sending → Delivered → Seen)
 * Shows as single or double checkmark with appropriate color
 */
const MessageStatusBadge = ({ status, seenByRole }: MessageStatusBadgeProps) => {
  if (!status) {
    return null;
  }

  const isSeen = status === "SEEN";
  const isDelivered = status === "DELIVERED" || isSeen;

  const baseClasses = "flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-slate-500 ml-1";

  const tooltip = status === "SENDING"
    ? "Sending..."
    : status === "DELIVERED"
      ? "Delivered"
      : seenByRole
        ? `Seen by ${seenByRole}`
        : "Seen";

  return (
    <span className={baseClasses} title={tooltip}>
      <Check className={`w-3 h-3 ${isSeen ? "text-green-500" : isDelivered ? "text-blue-500" : "opacity-50"}`} />
      {isSeen && <Check className="w-3 h-3 text-green-500 -ml-1.5" />}
    </span>
  );
};

export default MessageStatusBadge;
