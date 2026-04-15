import { ArrowRight, Activity, Clock3, MessageCircle, MessageSquareText, Users, Bot, Scale } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import StandardDashboard from "./StandardDashboard";
import useAuth from "../../../hooks/useAuth";
import { useGetLiveChatAnalytics } from "../../../services/analyticsServices";

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

const formatPercent = (value?: number | null) => {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  const normalized = Number(value);
  const sign = normalized > 0 ? "+" : "";
  return `${sign}${normalized.toFixed(1)}%`;
};

const sectionCardClass = "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-6";

const AdvancedDashboard = () => {
  const navigate = useNavigate();
  const { tenant } = useAuth();
  const { analytics, isLoading, error, mutate } = useGetLiveChatAnalytics({ days: 7 });

  const overview = analytics?.overview;
  const trends = analytics?.trends;
  const advanced = analytics?.advanced;
  const volumeData = analytics?.conversationVolume || [];
  const peakVolume = Math.max(...volumeData.map((point) => point.totalChats), 1);
  const planName = tenant?.subscriptionData?.planName || tenant?.subscription?.planName || "Basic";
  const hasAdvancedAnalytics = Boolean(tenant?.subscriptionData?.configuration?.limits?.hasAdvancedAnalytics);

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Chats",
        value: formatInteger(overview?.totalChats),
        helper: formatPercent(trends?.totalChatsPercent),
        icon: MessageCircle,
      },
      {
        label: "Total Users",
        value: formatInteger(overview?.totalUsers),
        helper: formatPercent(trends?.totalUsersPercent),
        icon: Users,
      },
      {
        label: "Total Messages",
        value: formatInteger(overview?.totalMessages),
        helper: formatPercent(trends?.totalMessagesPercent),
        icon: MessageSquareText,
      },
      {
        label: "Avg. Response Time",
        value: formatSeconds(overview?.averageResponseTimeSeconds),
        helper: formatPercent(trends?.averageResponseTimePercent),
        icon: Clock3,
      },
    ],
    [overview, trends],
  );

  const refreshAnalytics = async () => {
    await mutate();
  };

  return (
    <div className="space-y-6">
      <StandardDashboard hideAnalyticsTeaser />

      <div className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm dark:border-cyan-900/40 dark:from-cyan-900/20 dark:to-slate-800 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-cyan-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-700 dark:border-cyan-900/40 dark:bg-slate-900 dark:text-cyan-300">
              Advanced analytics
            </div>
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Live performance insights</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Full analytics are loaded from the summary API and displayed inline when the tenant plan includes advanced analytics.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                Plan: {planName}
              </span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                {hasAdvancedAnalytics ? "Advanced analytics enabled" : "Advanced analytics unavailable"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refreshAnalytics}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <Activity className="h-4 w-4" />
              Refresh analytics
            </button>
            <button
              type="button"
              onClick={() => navigate("/portal/analytics")}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500"
            >
              Open full analytics
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">Advanced analytics could not be loaded right now. Refresh to retry the live summary endpoint.</p>
            <button
              type="button"
              onClick={refreshAnalytics}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
            >
              <Activity className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const iconStyles = "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300";

          return (
            <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyles}`}>
                  <card.icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-slate-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  Trend
                </span>
              </div>
              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{card.value}</p>
              <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{card.helper}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className={`${sectionCardClass} xl:col-span-2`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h4 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Conversation Volume</h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Daily traffic and resolution ratios from the live analytics API.</p>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">{analytics?.periodDays || 7} day window</span>
          </div>

          {isLoading && !analytics ? (
            <div className="mt-6 h-60 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
          ) : (
            <div className="mt-6 grid h-60 grid-cols-[repeat(auto-fit,minmax(42px,1fr))] items-end gap-2 sm:gap-3">
              {volumeData.length === 0 ? (
                <div className="col-span-full flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                  No analytics volume data yet.
                </div>
              ) : (
                volumeData.map((point) => {
                  const totalHeight = Math.max(8, Math.round((point.totalChats / peakVolume) * 100));
                  const resolvedHeight = point.totalChats > 0
                    ? Math.max(6, Math.round((point.resolved / point.totalChats) * totalHeight))
                    : 0;

                  return (
                    <div key={point.day} className="flex min-w-0 flex-col items-center gap-2">
                      <div className="relative flex h-40 w-full items-end justify-center rounded-2xl bg-slate-50 dark:bg-slate-900/70">
                        <div className="absolute bottom-0 w-4/5 rounded-md bg-cyan-200 dark:bg-cyan-900/50" style={{ height: `${totalHeight}%` }} />
                        <div className="absolute bottom-0 w-4/5 rounded-md bg-cyan-600/90" style={{ height: `${resolvedHeight}%` }} />
                      </div>
                      <div className="text-center">
                        <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">{point.day}</span>
                        <span className="block text-[11px] text-slate-400 dark:text-slate-500">{formatInteger(point.totalChats)} chats</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className={sectionCardClass}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
              <Scale className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Operations</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Alert pressure and queue health.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100">
              <p className="font-semibold">{formatInteger(advanced?.operations?.missedChats)} missed chats</p>
              <p className="mt-1 text-xs opacity-80">Waiting over five minutes.</p>
            </div>
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-rose-900 dark:bg-rose-900/20 dark:text-rose-100">
              <p className="font-semibold">{formatInteger(advanced?.operations?.slowResponses)} slow conversations</p>
              <p className="mt-1 text-xs opacity-80">Exceeded the response threshold.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100">
              <p className="font-semibold">{formatSeconds(overview?.averageResolutionTimeSeconds)} average resolution</p>
              <p className="mt-1 text-xs opacity-80">Current period resolution speed.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className={sectionCardClass}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Agent Performance</h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Top agents ranked by resolved chats.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/portal/analytics")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Analytics page
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {(advanced?.agentPerformance || []).slice(0, 5).map((agent, index) => (
              <div
                key={agent.agentId}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {index + 1}. {agent.agentName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    First response {formatSeconds(agent.avgFirstResponseSeconds)} · Resolution {formatSeconds(agent.avgResolutionSeconds)}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                  {formatInteger(agent.resolvedChats)} resolved
                </span>
              </div>
            ))}
            {(advanced?.agentPerformance || []).length === 0 && !isLoading && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                No resolved agent data available for this period.
              </div>
            )}
          </div>
        </div>

        <div className={sectionCardClass}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Customer Insights</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Segmentation, conversions, and keywords.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">New visitors</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{formatInteger(advanced?.customerSegmentation?.newUsers)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Returning visitors</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{formatInteger(advanced?.customerSegmentation?.returningUsers)}</p>
            </div>
            <div className="rounded-2xl bg-cyan-50 px-4 py-3 dark:bg-cyan-900/20 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Chat to lead conversion</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{formatPercent(advanced?.conversion?.chatToLeadPercent)}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{formatInteger(advanced?.conversion?.leadChats)} lead chats from {formatInteger(advanced?.conversion?.totalChats)} total chats</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Top keywords</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(advanced?.conversationInsights?.topKeywords || []).slice(0, 8).map((item) => (
                <span
                  key={item.keyword}
                  className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200"
                >
                  {item.keyword}
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    {item.count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;