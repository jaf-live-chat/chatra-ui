/**
 * Calculates average chat duration from a list of chat entries
 * @param chats - Array of chat entries with duration property
 * @returns Formatted string "Xm Ys" or "0m" if no valid durations
 */
export function calculateAverageDuration(chats: Array<{ duration: string }>): string {
  if (chats.length === 0) {
    return "0m";
  }

  // Parse duration strings and convert to total seconds
  const totalSeconds = chats.reduce((sum, chat) => {
    const match = chat.duration.match(/(\d+)m\s+(\d+)s/);
    if (!match) {
      return sum;
    }
    const mins = parseInt(match[1], 10);
    const secs = parseInt(match[2], 10);
    return sum + (mins * 60 + secs);
  }, 0);

  if (totalSeconds === 0) {
    return "0m";
  }

  const averageSeconds = Math.round(totalSeconds / chats.length);
  const mins = Math.floor(averageSeconds / 60);
  const secs = averageSeconds % 60;

  return `${mins}m ${String(secs).padStart(2, "0")}s`;
}
