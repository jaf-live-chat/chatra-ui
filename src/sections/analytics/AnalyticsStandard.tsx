import {
  Clock3,
  Lock,
  MessageCircle,
  MessageSquareText,
  RotateCcw,
  TrendingUp,
  Users,
} from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import type { LiveChatAnalytics } from "../../models/AnalyticsModel";

type AnalyticsStandardProps = {
  canUpgrade?: boolean;
  planName?: string | null;
  analytics?: LiveChatAnalytics | null;
  isLoading?: boolean;
  hasDataError?: boolean;
  onUpgrade?: () => void;
  onRetry?: () => void | Promise<unknown>;
};

type LockedCardProps = {
  title: string;
  description: string;
  canUpgrade: boolean;
  onUpgrade?: () => void;
};

const formatDateLabel = (value?: string | null) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const LockedCard = ({ title, description, canUpgrade, onUpgrade }: LockedCardProps) => {
  return (
    <div className="flex h-full min-h-[18rem] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="pointer-events-none select-none rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4 opacity-40 blur-[2px] md:p-5">
        <div className="h-5 w-44 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-60 rounded bg-slate-100" />
        <div className="mt-6 space-y-2">
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-5/6 rounded bg-slate-100" />
          <div className="h-3 w-4/6 rounded bg-slate-100" />
        </div>
      </div>

      <div className="mt-5 flex flex-1 flex-col items-center justify-end text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
          <Lock className="h-6 w-6 text-slate-500" />
        </div>
        <h4 className="mt-4 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{title}</h4>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
        <button
          type="button"
          disabled={!canUpgrade || !onUpgrade}
          onClick={onUpgrade}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {canUpgrade ? "Upgrade to Pro" : "Pro required"}
        </button>
      </div>
    </div>
  );
};

const formatInteger = (value?: number | null) => {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return Number(value).toLocaleString();
};

const formatSeconds = (value?: number | null) => {
  if (!Number.isFinite(value) || value === null) {
    return "--";
  }

  const safeSeconds = Math.max(0, Math.round(Number(value)));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
};

const formatPercentDelta = (value?: number | null) => {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  const normalized = Number(value);
  const sign = normalized > 0 ? "+" : "";
  return `${sign}${normalized.toFixed(1)}%`;
};

const AnalyticsStandard = ({
  canUpgrade = true,
  planName = "Basic",
  analytics,
  isLoading = false,
  hasDataError = false,
  onUpgrade,
  onRetry,
}: AnalyticsStandardProps) => {
  const overview = analytics?.overview;
  const trends = analytics?.trends;
  const volumeData = analytics?.conversationVolume || [];
  const peakVolume = Math.max(...volumeData.map((point) => point.totalChats), 1);
  const dateFromLabel = formatDateLabel(analytics?.dateRange?.from);
  const dateToLabel = formatDateLabel(analytics?.dateRange?.to);
  const analyticsPeriod = analytics?.periodDays ?? 7;

  return (
    <>
      <PageTitle
        title="Live Chat Analytics"
        description="Performance overview and customer insights."
        canonical="/portal/analytics"
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-end md:justify-between md:p-6">
          <div>
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Current plan: {planName}
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Live Chat Analytics</h1>
            <p className="mt-2 max-w-2xl text-base leading-6 text-slate-600">
              Performance overview and customer insights for the latest {analyticsPeriod}-day window.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Report range</p>
            <p className="mt-1">{dateFromLabel} to {dateToLabel}</p>
          </div>
        </div>

        {hasDataError && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <p className="text-sm">
              Live analytics could not be loaded right now. Showing your current plan layout while data refreshes.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry data
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
              <Lock className="h-5 w-5 text-slate-500" />
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-700">
              <span className="font-semibold text-slate-900">Advanced Analysis &amp; Reporting </span>
              Unlock advanced filters, CSV exports, and unlimited data history.
            </p>
          </div>
          <button
            type="button"
            disabled={!canUpgrade || !onUpgrade}
            onClick={onUpgrade}
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {canUpgrade ? "Upgrade" : "Pro only"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: <MessageCircle className="h-5 w-5 text-slate-500" />,
              label: "Total Chats",
              value: formatInteger(overview?.totalChats),
              delta: formatPercentDelta(trends?.totalChatsPercent),
            },
            {
              icon: <Users className="h-5 w-5 text-slate-500" />,
              label: "Total Users",
              value: formatInteger(overview?.totalUsers),
              delta: formatPercentDelta(trends?.totalUsersPercent),
            },
            {
              icon: <MessageSquareText className="h-5 w-5 text-slate-500" />,
              label: "Total Messages",
              value: formatInteger(overview?.totalMessages),
              delta: formatPercentDelta(trends?.totalMessagesPercent),
            },
            {
              icon: <Clock3 className="h-5 w-5 text-slate-500" />,
              label: "Avg. Response Time",
              value: formatSeconds(overview?.averageResponseTimeSeconds),
              delta: formatPercentDelta(trends?.averageResponseTimePercent),
            },
          ].map((card) => (
            <div
              key={card.label}
              className="flex min-h-[10.5rem] flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
            >
              <div className="flex items-center justify-between">
                <span>{card.icon}</span>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  <TrendingUp className="mr-1 inline h-3 w-3" />
                  {card.delta}
                </span>
              </div>
              <p className="mt-5 text-sm text-slate-500">{card.label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Conversation Volume</h3>
                <p className="mt-2 text-sm text-slate-600">Daily and weekly summaries of your chat activity.</p>
              </div>
              <p className="text-sm text-slate-500">{analyticsPeriod} days of data</p>
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-cyan-50 to-white p-4 sm:p-5">
              {isLoading && !analytics ? (
                <div className="h-56 animate-pulse rounded-2xl bg-white/70" />
              ) : (
                <div className="grid h-56 grid-cols-[repeat(auto-fit,minmax(42px,1fr))] items-end gap-2 sm:gap-3">
                  {volumeData.map((point) => {
                    const totalHeight = Math.max(8, Math.round((point.totalChats / peakVolume) * 100));
                    const resolvedHeight = point.totalChats > 0
                      ? Math.max(6, Math.round((point.resolved / point.totalChats) * totalHeight))
                      : 0;

                    return (
                      <div key={point.day} className="flex min-w-0 flex-col items-center gap-2">
                        <div className="relative flex h-40 w-full items-end justify-center rounded-2xl bg-white/80">
                          <div
                            className="absolute bottom-0 w-4/5 rounded-md bg-cyan-200"
                            style={{ height: `${totalHeight}%` }}
                          />
                          <div
                            className="absolute bottom-0 w-4/5 rounded-md bg-cyan-600/80"
                            style={{ height: `${resolvedHeight}%` }}
                          />
                        </div>
                        <div className="text-center">
                          <span className="block text-xs font-semibold text-slate-500">{point.day}</span>
                          <span className="block text-[11px] text-slate-400">{formatInteger(point.totalChats)} chats</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <LockedCard
            title="Operations & Monitoring"
            description="Unlock real-time live dashboard and alerts for missed chats and slow responses."
            canUpgrade={canUpgrade}
            onUpgrade={onUpgrade}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LockedCard
            title="Agent Performance"
            description="Unlock agent performance tracking and team leaderboards."
            canUpgrade={canUpgrade}
            onUpgrade={onUpgrade}
          />
          <LockedCard
            title="SLA & First Response"
            description="Track first response times and resolution times per agent."
            canUpgrade={canUpgrade}
            onUpgrade={onUpgrade}
          />
          <LockedCard
            title="Conversion Tracking"
            description="Track the full visitor journey from chat initiation to lead and sale."
            canUpgrade={canUpgrade}
            onUpgrade={onUpgrade}
          />
          <LockedCard
            title="Customer Insights"
            description="Unlock customer segmentation (new vs returning) and device data."
            canUpgrade={canUpgrade}
            onUpgrade={onUpgrade}
          />
          <LockedCard
            title="Conversation Insights"
            description="Unlock AI-driven insights, top keywords, and common customer questions."
            canUpgrade={canUpgrade}
            onUpgrade={onUpgrade}
          />
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Reporting Summary</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">A live snapshot of the current analytics window from the API.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Current plan</p>
                <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">{planName}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Reporting window</p>
                <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">{analyticsPeriod} days</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Chats in range</p>
                <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">{formatInteger(overview?.totalChats)}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Messages in range</p>
                <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">{formatInteger(overview?.totalMessages)}</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
              <p className="text-sm font-semibold text-cyan-900">Date range</p>
              <p className="mt-1 text-sm text-cyan-900/80">
                {dateFromLabel} to {dateToLabel}
              </p>
            </div>
          </div>
        </div>

        <LockedCard
          title="Deep Dive Analytics"
          description="Access granular agent performance tracking and specific SLA metrics."
          canUpgrade={canUpgrade}
          onUpgrade={onUpgrade}
        />
      </div>
    </>
  );
};

export default AnalyticsStandard;