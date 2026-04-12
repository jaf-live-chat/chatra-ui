export type MessageStatusType = "SENDING" | "DELIVERED" | "SEEN";

interface MessageStatusBadgeProps {
  status?: MessageStatusType;
  seenByRole?: string | null;
}

const MessageStatusBadge = ({ status, seenByRole }: MessageStatusBadgeProps) => {
  if (!status) {
    return null;
  }

  const statusLabel = status === "SENDING"
    ? "Sending"
    : status === "DELIVERED"
      ? "Delivered"
      : "Seen";

  const statusToneClass = status === "SENDING"
    ? "text-gray-400 dark:text-slate-500"
    : status === "DELIVERED"
      ? "text-cyan-600 dark:text-cyan-400"
      : "text-emerald-600 dark:text-emerald-400";

  const tooltip = status === "SENDING"
    ? "Sending..."
    : status === "DELIVERED"
      ? "Delivered"
      : seenByRole
        ? `Seen by ${seenByRole}`
        : "Seen";

  return (
    <span className={`ml-1 inline-flex items-center text-[10px] font-medium whitespace-nowrap ${statusToneClass}`} title={tooltip}>
      {statusLabel}
    </span>
  );
};

export default MessageStatusBadge;
