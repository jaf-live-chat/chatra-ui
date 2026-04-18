import { useMemo } from "react";
import type { TextSize } from "../types";

export const useWidgetStyling = ({ textSize, isDarkMode }: { textSize: TextSize; isDarkMode: boolean }) => {
  const messageSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[11px] leading-5 sm:text-[12px]";
    }

    if (textSize === "large") {
      return "text-[13px] leading-6 sm:text-[16px] sm:leading-7";
    }

    return "text-[12px] leading-6 sm:text-[13px]";
  }, [textSize]);

  const messageMetaSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[9px] leading-4 sm:text-[10px]";
    }

    if (textSize === "large") {
      return "text-[10px] leading-4 sm:text-[11px]";
    }

    return "text-[10px] leading-4 sm:text-[11px]";
  }, [textSize]);

  const composerTextClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[11px] leading-5 sm:text-[12px]";
    }

    if (textSize === "large") {
      return "text-[13px] leading-6 sm:text-[15px]";
    }

    return "text-[12px] leading-6 sm:text-[13px]";
  }, [textSize]);

  const bubblePaddingClass = useMemo(() => {
    if (textSize === "small") {
      return "px-[12px] py-[8px] sm:px-[14px] sm:py-[9px]";
    }

    if (textSize === "large") {
      return "px-[15px] py-[10px] sm:px-[18px] sm:py-[12px]";
    }

    return "px-3 py-2 sm:px-4 sm:py-2.5";
  }, [textSize]);

  const avatarSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "h-8 w-8 text-[10px] sm:h-9 sm:w-9 sm:text-[11px]";
    }

    if (textSize === "large") {
      return "h-10 w-10 text-[11px] sm:h-11 sm:w-11 sm:text-sm";
    }

    return "h-9 w-9 text-[11px] sm:h-[38px] sm:w-[38px] sm:text-[12px]";
  }, [textSize]);

  const helperTextSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[11px] sm:text-xs";
    }

    if (textSize === "large") {
      return "text-[13px] sm:text-sm";
    }

    return "text-[12px] sm:text-[13px]";
  }, [textSize]);

  const panelSpacingClass = useMemo(() => {
    if (textSize === "small") {
      return "gap-2 sm:gap-3";
    }

    if (textSize === "large") {
      return "gap-4 sm:gap-5";
    }

    return "gap-3 sm:gap-4";
  }, [textSize]);

  const headerTitleClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[0.9rem] sm:text-[0.96rem]";
    }

    if (textSize === "large") {
      return "text-[1.02rem] sm:text-[1.15rem]";
    }

    return "text-[0.98rem] sm:text-[1.05rem]";
  }, [textSize]);

  const headerStatusClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[9px] tracking-wide sm:text-[10px]";
    }

    if (textSize === "large") {
      return "text-[10px] tracking-wide sm:text-[11px]";
    }

    return "text-[10px] tracking-wide sm:text-[11px]";
  }, [textSize]);

  const composerGapClass = useMemo(() => {
    if (textSize === "small") {
      return "gap-1.5 sm:gap-1.5";
    }

    if (textSize === "large") {
      return "gap-2.5 sm:gap-3";
    }

    return "gap-1.5 sm:gap-2";
  }, [textSize]);

  const composerButtonSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "h-9 w-9 sm:h-10 sm:w-10";
    }

    if (textSize === "large") {
      return "h-11 w-11 sm:h-12 sm:w-12";
    }

    return "h-10 w-10 sm:h-11 sm:w-11";
  }, [textSize]);

  const inputPaddingClass = useMemo(() => {
    if (textSize === "small") {
      return "px-2 py-1.5 sm:px-2 sm:py-1.5";
    }

    if (textSize === "large") {
      return "px-3 py-2 sm:px-4 sm:py-2.5";
    }

    return "px-2.5 py-2 sm:px-3 sm:py-2";
  }, [textSize]);

  const theme = isDarkMode
    ? {
      shell: "bg-slate-950 border-slate-300/55 text-slate-100 shadow-[0_34px_72px_-28px_rgba(2,6,23,0.9)] ring-2 ring-slate-800/65 outline outline-1 outline-slate-200/20 backdrop-blur-xl",
      header: "bg-slate-900 border-b border-slate-700 text-slate-100 shadow-sm",
      panel: "bg-slate-900/85 border-slate-500/70 shadow-[0_18px_36px_-26px_rgba(2,6,23,0.75)]",
      body: "bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.16),_transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(15,23,42,0.8)_100%)]",
      subText: "text-cyan-100/90 text-xs font-medium",
      muted: "text-slate-400 text-xs",
      bubbleVisitor: "bg-cyan-600 text-white rounded-3xl rounded-tr-lg border border-cyan-500/70 shadow-[0_18px_32px_-22px_rgba(8,145,178,0.95)]",
      bubbleAgent: "bg-slate-800/95 text-slate-100 border border-slate-600/80 rounded-3xl rounded-tl-lg shadow-[0_18px_30px_-24px_rgba(15,23,42,0.95)]",
      composer: "bg-slate-900/96 border-t border-slate-700",
      input: "bg-slate-800/95 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-2xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20",
      button: "bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-slate-700 disabled:cursor-not-allowed",
      buttonSecondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600/80",
      quickBar: "bg-slate-900/85 border-y border-slate-700/80",
      quickDock: "relative w-full",
      quickDockHeader: "text-slate-200/90 text-[11px] font-semibold tracking-[0.18em]",
      quickDockHint: "text-slate-400 text-[11px]",
      quickDockToggle: "w-full inline-flex items-center justify-center gap-2 rounded-[18px] border border-slate-700/80 bg-slate-900/92 px-4 py-2 text-[11px] font-semibold text-slate-200 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.9)] transition-colors hover:bg-slate-800",
      quickDockPanel: "absolute bottom-full mb-2 left-0 right-0 rounded-[18px] border border-slate-700/80 bg-slate-950/95 px-3 pb-3 pt-2.5 shadow-[0_20px_34px_-24px_rgba(15,23,42,0.95)] backdrop-blur-xl",
      quickDockChip: "w-full rounded-full border border-slate-600/80 bg-slate-800/90 px-3.5 py-2 text-center text-[11px] font-medium text-slate-100 transition-colors hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed",
      error: "bg-red-950/50 text-red-200 border border-red-900/50",
      welcomeTitle: "text-slate-100 text-sm font-semibold",
      headerAction: "bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700",
      headerIconButton: "border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700",
      headerMenuPanel: "absolute right-0 top-[calc(100%+8px)] z-30 w-60 rounded-[18px] border border-slate-700/80 bg-slate-900/98 p-2 shadow-[0_20px_34px_-18px_rgba(2,6,23,0.92)] backdrop-blur-xl",
      headerMenuItem: "w-full rounded-xl px-3.5 py-2.5 text-left text-[14px] font-normal text-slate-200 transition-colors hover:bg-slate-800/90",
      headerMenuItemDestructive: "text-red-300 hover:bg-red-950/45",
      headerMenuIcon: "h-4 w-4 text-slate-400",
      headerMenuIconDestructive: "h-4 w-4 text-red-400",
      headerMenuDivider: "my-1 border-t border-slate-700/75",
      settingsSectionTitle: "text-slate-400 text-[11px] font-semibold tracking-[0.18em]",
      settingsDivider: "border-slate-700/80",
      settingsText: "text-slate-100 text-[13px] font-medium",
      settingsMuted: "text-slate-400 text-[11px] leading-5",
      settingsCard: "rounded-[22px] border border-slate-700/70 bg-slate-900/55 px-4 py-3 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.95)] backdrop-blur-md",
      settingsControlShell: "grid grid-cols-3 rounded-2xl border p-1 shadow-inner",
      settingsControlShellTone: "border-slate-700 bg-slate-800/80",
      settingsControlActive: "bg-slate-800 text-cyan-200 border border-cyan-500/35 shadow-[0_10px_18px_-16px_rgba(8,145,178,0.7)]",
      settingsControlIdle: "text-slate-300 hover:bg-slate-700/70",
      toggleOff: "bg-slate-600",
      toggleOn: "bg-cyan-600",
      modalBackdrop: "bg-slate-950/68",
      modalCard: "bg-slate-900 border border-slate-700 shadow-2xl",
      modalPrimary: "bg-red-500 hover:bg-red-600 text-white",
      modalSecondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
      poweredText: "text-slate-300",
      poweredBrand: "text-cyan-300",
    }
    : {
      shell: "bg-white border-slate-300 text-slate-900 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.3)] ring-2 ring-slate-200/70 outline outline-1 outline-slate-300/75 backdrop-blur-xl",
      header: "bg-white border-b border-slate-200 text-slate-900 shadow-sm",
      panel: "bg-white border-slate-300 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.3)]",
      body: "bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.08),_transparent_42%),linear-gradient(180deg,#f8fbfc_0%,#eef5f8_100%)]",
      subText: "text-slate-600 text-xs font-medium",
      muted: "text-slate-500 text-xs",
      bubbleVisitor: "bg-cyan-600 text-white rounded-3xl rounded-tr-lg border border-cyan-500/80 shadow-[0_16px_28px_-22px_rgba(8,145,178,0.65)]",
      bubbleAgent: "bg-white text-slate-900 border border-slate-300 rounded-3xl rounded-tl-lg shadow-[0_16px_26px_-24px_rgba(15,23,42,0.35)]",
      composer: "bg-white border-t border-slate-200",
      input: "bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-2xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
      button: "bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-slate-200 disabled:cursor-not-allowed",
      buttonSecondary: "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200",
      quickBar: "bg-white/92 border-y border-slate-200",
      quickDock: "relative w-full",
      quickDockHeader: "text-slate-500 text-[11px] font-semibold tracking-[0.18em]",
      quickDockHint: "text-slate-500 text-[11px]",
      quickDockToggle: "w-full inline-flex items-center justify-center gap-2 rounded-[18px] border border-slate-200 bg-white/96 px-4 py-2 text-[11px] font-semibold text-cyan-700 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.16)] transition-colors hover:bg-white",
      quickDockPanel: "absolute bottom-full mb-2 left-0 right-0 rounded-[18px] border border-slate-200 bg-white/98 px-3 pb-3 pt-2.5 shadow-[0_20px_34px_-24px_rgba(15,23,42,0.2)] backdrop-blur-xl",
      quickDockChip: "w-full rounded-full border border-cyan-200 bg-cyan-50 px-3.5 py-2 text-center text-[11px] font-medium text-cyan-700 transition-colors hover:bg-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed",
      error: "bg-red-50 text-red-700 border border-red-200",
      welcomeTitle: "text-slate-800 text-sm font-semibold",
      headerAction: "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200",
      headerIconButton: "border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200",
      headerMenuPanel: "absolute right-0 top-[calc(100%+8px)] z-30 w-60 rounded-[18px] border border-slate-200 bg-white/98 p-2 shadow-[0_20px_34px_-18px_rgba(15,23,42,0.22)] backdrop-blur-xl",
      headerMenuItem: "w-full rounded-xl px-3.5 py-2.5 text-left text-[14px] font-normal text-slate-600 transition-colors hover:bg-slate-100",
      headerMenuItemDestructive: "text-red-500 hover:bg-red-50",
      headerMenuIcon: "h-4 w-4 text-slate-400",
      headerMenuIconDestructive: "h-4 w-4 text-red-500",
      headerMenuDivider: "my-1 border-t border-slate-200",
      settingsSectionTitle: "text-slate-500 text-[11px] font-semibold tracking-[0.18em]",
      settingsDivider: "border-slate-200",
      settingsText: "text-slate-800 text-[13px] font-medium",
      settingsMuted: "text-slate-500 text-[11px] leading-5",
      settingsCard: "rounded-[22px] border border-slate-200 bg-white/88 px-4 py-3 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.28)] backdrop-blur-md",
      settingsControlShell: "grid grid-cols-3 rounded-2xl border p-1 shadow-inner",
      settingsControlShellTone: "border-slate-200 bg-slate-100/90",
      settingsControlActive: "bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm",
      settingsControlIdle: "text-slate-500 hover:bg-white",
      toggleOff: "bg-slate-300",
      toggleOn: "bg-cyan-600",
      modalBackdrop: "bg-slate-900/45",
      modalCard: "bg-white border border-slate-200 shadow-2xl",
      modalPrimary: "bg-red-500 hover:bg-red-600 text-white",
      modalSecondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200",
      poweredText: "text-slate-500",
      poweredBrand: "text-cyan-700",
    };

  return {
    messageSizeClass,
    messageMetaSizeClass,
    composerTextClass,
    bubblePaddingClass,
    avatarSizeClass,
    helperTextSizeClass,
    panelSpacingClass,
    headerTitleClass,
    headerStatusClass,
    composerGapClass,
    composerButtonSizeClass,
    inputPaddingClass,
    theme,
  };
};
