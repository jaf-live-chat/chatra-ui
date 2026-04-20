import { MessageCircle, X } from "lucide-react";

type LauncherButtonProps = {
  isOpen: boolean;
  unreadCount: number;
  resolvedAccent: string;
  accentShadow: string;
  widgetLogo: string;
  title: string;
  buttonClassName: string;
  onToggle: () => void;
};

const LauncherButton = ({
  isOpen,
  unreadCount,
  resolvedAccent,
  accentShadow,
  widgetLogo,
  title,
  buttonClassName,
  onToggle,
}: LauncherButtonProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-white/30 text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:scale-105 active:scale-95 ${buttonClassName}`}
      aria-label="Open live chat"
      style={{
        backgroundColor: resolvedAccent,
        boxShadow: accentShadow,
      }}
    >
      {!isOpen ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-3 rounded-full"
            style={{
              backgroundColor: resolvedAccent,
              opacity: 0.08,
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              backgroundColor: resolvedAccent,
              animation: "widgetPulseOut 3.4s ease-out infinite",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              backgroundColor: resolvedAccent,
              opacity: 0.72,
              animation: "widgetPulseOut 3.4s ease-out infinite",
              animationDelay: "1.7s",
            }}
          />
        </>
      ) : null}

      <span className="relative z-10">
        {isOpen ? (
          <X className="h-5 w-5 transition-transform duration-200" />
        ) : widgetLogo ? (
          <span
            className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white/15 ring-1 ring-white/25"
            style={{ backgroundColor: resolvedAccent }}
          >
            <img
              src={widgetLogo}
              alt={`${title} icon`}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </span>
        ) : (
          <MessageCircle className="h-5 w-5 transition-transform duration-200 group-hover:rotate-6" />
        )}
      </span>

      {unreadCount > 0 && !isOpen ? (
        <span className="absolute -right-3 -top-3 z-20 flex min-w-[24px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-lg">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
};

export default LauncherButton;
