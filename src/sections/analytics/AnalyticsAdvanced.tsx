import {
  Activity,
  ArrowRight,
  Bot,
  Clock3,
  CreditCard,
  MessageCircle,
  MessageSquareText,
  RotateCcw,
  TrendingUp,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import PageTitle from "../../components/common/PageTitle";
import useGetRole from "../../hooks/useGetRole";
import type { LiveChatAnalytics } from "../../models/AnalyticsModel";
import { useGetPayments } from "../../services/paymentServices";
import formatAmount from "../../utils/amountFormatter";

type AnalyticsAdvancedProps = {
  analytics?: LiveChatAnalytics | null;
  isLoading?: boolean;
  hasDataError?: boolean;
  onRetry?: () => void | Promise<unknown>;
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

const formatPercent = (value?: number | null) => {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  const normalized = Number(value);
  const sign = normalized > 0 ? "+" : "";
  return `${sign}${normalized.toFixed(1)}%`;
};

const AnalyticsAdvanced = ({
  analytics,
  isLoading = false,
  hasDataError = false,
  onRetry,
}: AnalyticsAdvancedProps) => {
  const navigate = useNavigate();
  const { isMasterAdmin } = useGetRole();
  const { payments, isLoading: isPaymentsLoading, error: paymentsError } = useGetPayments();
  const overview = analytics?.overview;
  const trends = analytics?.trends;
  const advanced = analytics?.advanced;

  const paymentSummary = useMemo(() => {
    const completed = payments.filter((payment) => payment.status === "COMPLETED");
    const pending = payments.filter((payment) => payment.status === "PENDING");
    const failed = payments.filter((payment) => payment.status === "FAILED");
    const cancelled = payments.filter((payment) => payment.status === "CANCELLED");

    const totalRevenue = completed.reduce((sum, payment) => {
      const amount = Number(payment.amount ?? 0);
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);

    return {
      totalRevenue,
      completedCount: completed.length,
      pendingCount: pending.length,
      failedCount: failed.length + cancelled.length,
      totalTransactions: payments.length,
    };
  }, [payments]);

  return (
    <>
      <PageTitle
        title="Live Chat Analytics"
        description="Advanced performance monitoring and customer insights."
        canonical="/portal/analytics"
      />

      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Live Chat Analytics</h1>
            <p className="mt-2 text-base text-slate-600">Advanced performance monitoring and customer insights.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-800">
              Pro unlocked
            </span>
            {isMasterAdmin && (
              <button
                type="button"
                onClick={() => navigate("/portal/payments")}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-800 transition hover:bg-emerald-50"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Payments
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {hasDataError && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <p className="text-sm">
              Some advanced analytics data could not be loaded. Retry to fetch current metrics.
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: <MessageCircle className="h-5 w-5 text-slate-500" />, label: "Total Chats", value: formatInteger(overview?.totalChats), delta: formatPercent(trends?.totalChatsPercent) },
            { icon: <Users className="h-5 w-5 text-slate-500" />, label: "Total Users", value: formatInteger(overview?.totalUsers), delta: formatPercent(trends?.totalUsersPercent) },
            { icon: <MessageSquareText className="h-5 w-5 text-slate-500" />, label: "Total Messages", value: formatInteger(overview?.totalMessages), delta: formatPercent(trends?.totalMessagesPercent) },
            { icon: <Clock3 className="h-5 w-5 text-slate-500" />, label: "Avg. Response Time", value: formatSeconds(overview?.averageResponseTimeSeconds), delta: formatPercent(trends?.averageResponseTimePercent) },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span>{card.icon}</span>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  <TrendingUp className="mr-1 inline h-3 w-3" />
                  {card.delta}
                </span>
              </div>
              <p className="mt-5 text-sm text-slate-500">{card.label}</p>
              <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">Conversation Volume</h3>
            <p className="mt-2 text-sm text-slate-600">Daily and weekly summaries of your chat activity.</p>
            <div className="mt-6 rounded-xl border border-slate-100 bg-gradient-to-b from-cyan-50 to-white p-4">
              {isLoading && !analytics ? (
                <div className="h-56 animate-pulse rounded-lg bg-white/70" />
              ) : (
                <div className="space-y-3">
                  {(analytics?.conversationVolume || []).map((point) => {
                    const resolvedPct = point.totalChats > 0
                      ? Math.round((point.resolved / point.totalChats) * 100)
                      : 0;

                    return (
                      <div key={point.day}>
                        <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                          <span className="font-semibold">{point.day}</span>
                          <span>{point.resolved}/{point.totalChats} resolved</span>
                        </div>
                        <div className="h-2 w-full rounded bg-slate-100">
                          <div
                            className="h-2 rounded bg-cyan-600"
                            style={{ width: `${Math.max(0, Math.min(100, resolvedPct))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Operations &amp; Monitoring</h3>
            <p className="mt-2 text-sm text-slate-600">Live dashboard and alerts for missed chats and slow responses.</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {formatInteger(advanced?.operations?.missedChats)} missed chats waiting over 5 minutes.
              </div>
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-900">
                {formatInteger(advanced?.operations?.slowResponses)} conversations exceeded the response threshold.
              </div>
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                {formatSeconds(overview?.averageResolutionTimeSeconds)} average resolution time in the current period.
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Agent Performance</h3>
            <p className="mt-2 text-sm text-slate-600">Resolution, first response, and CSAT leaderboard.</p>
            <div className="mt-4 space-y-3">
              {(advanced?.agentPerformance || []).slice(0, 5).map((entry, idx) => (
                <div key={entry.agentId || entry.agentName} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="font-medium text-slate-900">{idx + 1}. {entry.agentName}</span>
                  <span className="text-sm font-semibold text-emerald-700">{formatInteger(entry.resolvedChats)} resolved</span>
                </div>
              ))}
              {!isLoading && (advanced?.agentPerformance || []).length === 0 && (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  No ended conversations found for this period.
                </p>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">SLA &amp; First Response</h3>
            <p className="mt-2 text-sm text-slate-600">Track first response and full resolution durations per agent.</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span>Average first response</span><span className="font-semibold text-slate-900">{formatSeconds(overview?.averageResponseTimeSeconds)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span>Average resolution</span><span className="font-semibold text-slate-900">{formatSeconds(overview?.averageResolutionTimeSeconds)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span>Breached chats</span><span className="font-semibold text-rose-700">{formatInteger(advanced?.operations?.slowResponses)}</span></div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Conversion Tracking</h3>
            <p className="mt-2 text-sm text-slate-600">Track visitor journeys from chat to lead and sale outcomes.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-cyan-50 px-4 py-3"><p className="text-slate-500">Chat to lead</p><p className="text-2xl font-bold text-slate-900">{(advanced?.conversion?.chatToLeadPercent || 0).toFixed(1)}%</p></div>
              <div className="rounded-xl bg-emerald-50 px-4 py-3"><p className="text-slate-500">Lead chats</p><p className="text-2xl font-bold text-slate-900">{formatInteger(advanced?.conversion?.leadChats)}</p></div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Customer Insights</h3>
            <p className="mt-2 text-sm text-slate-600">Segment users by behavior, channel, and return frequency.</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span>New visitors</span><span className="font-semibold">{formatInteger(advanced?.customerSegmentation?.newUsers)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span>Returning visitors</span><span className="font-semibold">{formatInteger(advanced?.customerSegmentation?.returningUsers)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span>Total with chat activity</span><span className="font-semibold">{formatInteger((advanced?.customerSegmentation?.newUsers || 0) + (advanced?.customerSegmentation?.returningUsers || 0))}</span></div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Conversation Insights</h3>
            <p className="mt-2 text-sm text-slate-600">Top keywords, intent clusters, and common support questions.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(advanced?.conversationInsights?.topKeywords || []).map((entry) => (
                <span key={entry.keyword} className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">{entry.keyword} ({entry.count})</span>
              ))}
              {!isLoading && (advanced?.conversationInsights?.topKeywords || []).length === 0 && (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">No keyword trends yet</span>
              )}
            </div>
          </div>
          {isMasterAdmin && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">Payment &amp; Subscriptions</h3>
                  <p className="mt-2 text-sm text-slate-600">Revenue and transaction performance for completed payments.</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/portal/payments")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
                >
                  Open payments
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-6 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-cyan-50 p-4">
                <p className="text-sm font-semibold text-emerald-900">Total Revenue</p>
                <p className="mt-1 text-4xl font-bold tracking-tight text-emerald-950">
                  {isPaymentsLoading ? "Loading..." : formatAmount(paymentSummary.totalRevenue)}
                </p>
                <p className="mt-1 text-xs text-emerald-900/80">
                  From {formatInteger(paymentSummary.completedCount)} completed payments
                </p>
              </div>

              {paymentsError && (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  Payments summary is temporarily unavailable. Open Payments to retry.
                </p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-slate-500">Total transactions</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{formatInteger(paymentSummary.totalTransactions)}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 px-4 py-3">
                  <p className="text-emerald-700">Completed</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-900">{formatInteger(paymentSummary.completedCount)}</p>
                </div>
                <div className="rounded-xl bg-amber-50 px-4 py-3">
                  <p className="text-amber-700">Pending</p>
                  <p className="mt-1 text-2xl font-bold text-amber-900">{formatInteger(paymentSummary.pendingCount)}</p>
                </div>
                <div className="rounded-xl bg-rose-50 px-4 py-3">
                  <p className="text-rose-700">Failed</p>
                  <p className="mt-1 text-2xl font-bold text-rose-900">{formatInteger(paymentSummary.failedCount)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AnalyticsAdvanced;