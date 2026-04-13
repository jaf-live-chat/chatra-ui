const SECOND_IN_MS = 1000;

export const getQueueDisplayId = (id: string): string => {
  const num = Number.parseInt(id.replace(/\D/g, ""), 10) || 0;
  return `Q-${((num * 6173) % 9000) + 1000}`;
};

export const parseTimestamp = (value?: string | null): number | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value).getTime();
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
};

export const formatElapsedTime = (startAt?: string | null, now = Date.now()): string => {
  const startTime = parseTimestamp(startAt);
  if (startTime === null) {
    return "0m 00s";
  }

  const elapsedSeconds = Math.max(0, Math.floor((now - startTime) / SECOND_IN_MS));
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
};
