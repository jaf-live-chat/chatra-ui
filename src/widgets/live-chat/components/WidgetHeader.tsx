import { History, Menu, Settings, SquareX } from "lucide-react";
import type { RefObject } from "react";

type WidgetHeaderProps = {
  themeHeader: string;
  headerTitleClass: string;
  headerStatusClass: string;
  headerIconButtonClass: string;
  headerMenuPanelClass: string;
  headerMenuItemClass: string;
  headerMenuItemDestructiveClass: string;
  headerMenuIconClass: string;
  headerMenuIconDestructiveClass: string;
  headerMenuDividerClass: string;
  isHeaderMenuOpen: boolean;
  setHeaderMenuOpen: (next: boolean | ((current: boolean) => boolean)) => void;
  headerMenuRef: RefObject<HTMLDivElement | null>;
  title: string;
  widgetLogo: string;
  resolvedAccent: string;
  accentSoftBorder: string;
  accentShadow: string;
  socketStatus: string;
  statusLabel: string;
  isDarkMode: boolean;
  hasActiveConversation: boolean;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenEndSessionPrompt: () => void;
  getWidgetInitials: (value: string) => string;
};

const WidgetHeader = ({
  themeHeader,
  headerTitleClass,
  headerStatusClass,
  headerIconButtonClass,
  headerMenuPanelClass,
  headerMenuItemClass,
  headerMenuItemDestructiveClass,
  headerMenuIconClass,
  headerMenuIconDestructiveClass,
  headerMenuDividerClass,
  isHeaderMenuOpen,
  setHeaderMenuOpen,
  headerMenuRef,
  title,
  widgetLogo,
  resolvedAccent,
  accentSoftBorder,
  accentShadow,
  socketStatus,
  statusLabel,
  isDarkMode,
  hasActiveConversation,
  onOpenSettings,
  onOpenHistory,
  onOpenEndSessionPrompt,
  getWidgetInitials,
}: WidgetHeaderProps) => {
  return (
    <div className={`${themeHeader} flex flex-shrink-0 items-center justify-between gap-3 px-5 py-4`}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className="h-11 w-11 shrink-0 overflow-hidden rounded-full border text-lg font-semibold text-white flex items-center justify-center"
          style={{
            backgroundColor: resolvedAccent,
            borderColor: accentSoftBorder,
            boxShadow: accentShadow,
          }}
        >
          {widgetLogo ? (
            <img
              src={widgetLogo}
              alt={`${title} logo`}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span>{getWidgetInitials(title)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate whitespace-nowrap font-semibold leading-tight ${headerTitleClass}`}>{title}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${socketStatus === "connected" ? "bg-emerald-400 animate-pulse" : socketStatus === "connecting" ? "bg-yellow-300" : "bg-emerald-400 animate-pulse"}`}
            />
            <p
              className={`${headerStatusClass} font-medium ${socketStatus === "connected" ? "text-emerald-500" : socketStatus === "connecting" ? "text-amber-500" : isDarkMode ? "text-slate-300" : "text-slate-500"}`}
            >
              {statusLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="relative" ref={headerMenuRef}>
          <button
            type="button"
            onClick={() => setHeaderMenuOpen((current) => !current)}
            className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 ${headerIconButtonClass}`}
            aria-label="Open chat menu"
            aria-expanded={isHeaderMenuOpen}
          >
            <Menu className="h-4.5 w-4.5" />
          </button>

          {isHeaderMenuOpen ? (
            <div className={headerMenuPanelClass}>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onOpenSettings();
                }}
                className={headerMenuItemClass}
              >
                <span className="flex items-center gap-2.5">
                  <Settings className={headerMenuIconClass} />
                  <span>Settings</span>
                </span>
              </button>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onOpenHistory();
                }}
                className={headerMenuItemClass}
              >
                <span className="flex items-center gap-2.5">
                  <History className={headerMenuIconClass} />
                  <span>Conversation History</span>
                </span>
              </button>
              <div className={headerMenuDividerClass} />
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onOpenEndSessionPrompt();
                }}
                className={`${headerMenuItemClass} ${headerMenuItemDestructiveClass}`}
              >
                <span className="flex items-center gap-2.5">
                  <SquareX className={headerMenuIconDestructiveClass} />
                  <span className="text-red-400">{hasActiveConversation ? "End Chat" : "Sign out & clear data"}</span>
                </span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default WidgetHeader;
