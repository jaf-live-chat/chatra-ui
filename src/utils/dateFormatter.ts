type DateFormat = "short" | "long";

interface FormatDateOptions {
  format?: DateFormat;
  isIncludeTime?: boolean;
}

export const formatDate = (
  dateString: string,
  { format = "long", isIncludeTime = false }: FormatDateOptions = {}
): string => {
  const date = new Date(dateString);

  const dateOptionsByFormat: Record<DateFormat, Intl.DateTimeFormatOptions> = {
    short: {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
    long: {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  };

  const dateOptions = dateOptionsByFormat[format] || dateOptionsByFormat.long;
  const formattedDate = date.toLocaleDateString("en-US", dateOptions);

  if (!isIncludeTime) {
    return formattedDate;
  }

  const formattedTime = date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" ", "");

  return `${formattedDate} ${formattedTime}`;
};
