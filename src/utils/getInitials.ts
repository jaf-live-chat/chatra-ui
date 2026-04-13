const fallbackFrom = (value: string) => {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "U";
  }

  const firstChar = normalized.match(/[A-Za-z0-9]/)?.[0] || normalized.slice(0, 1);
  return firstChar.toUpperCase();
};

const getWordInitial = (word: string) => {
  const normalizedWord = String(word || "").trim();
  if (!normalizedWord) {
    return "";
  }

  const firstChar = normalizedWord.match(/[A-Za-z0-9]/)?.[0] || normalizedWord.slice(0, 1);
  return firstChar.toUpperCase();
};

const getInitials = (name?: string | null, fallback = "U") => {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return fallbackFrom(fallback);
  }

  if (words.length === 1) {
    return getWordInitial(words[0]) || fallbackFrom(fallback);
  }

  const firstInitial = getWordInitial(words[0]);
  const lastInitial = getWordInitial(words[words.length - 1]);
  const initials = `${firstInitial}${lastInitial}`.trim();

  return initials || fallbackFrom(fallback);
};

export default getInitials;
