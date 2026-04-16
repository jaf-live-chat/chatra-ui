import { useState } from "react";
import { USER_ROLES } from "../../../constants/constants";
import useAuth from "../../../hooks/useAuth";
import AnalyticsAdvanced from "../../../sections/analytics/AnalyticsAdvanced";
import AnalyticsStandard from "../../../sections/analytics/AnalyticsStandard";
import { useGetLiveChatAnalytics } from "../../../services/analyticsServices";
import { useNavigate } from "react-router";

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { user, tenant, refreshSession } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);
  const {
    analytics,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
    mutate: refreshAnalytics,
  } = useGetLiveChatAnalytics({ days: 7 });

  const currentRole = user?.role;
  const isSupportAgent = currentRole === USER_ROLES.SUPPORT_AGENT.value;
  const isPrivilegedUser =
    currentRole === USER_ROLES.ADMIN.value || currentRole === USER_ROLES.MASTER_ADMIN.value;

  const hasSubscriptionData = Boolean(tenant?.subscriptionData);
  const hasAdvancedAnalytics = Boolean(
    tenant?.subscriptionData?.configuration?.limits?.hasAdvancedAnalytics
  );

  const handleUpgrade = () => {
    navigate(`/portal/tenants/${tenant?.id}?openPlanChange=1`, {
      state: { openPlanChangeDrawer: true },
    });
  };

  const handleRetry = async () => {
    setIsRetrying(true);

    try {
      await refreshSession();
    } finally {
      setIsRetrying(false);
    }
  };

  if (isSupportAgent) {
    return (
      <AnalyticsStandard
        canUpgrade={false}
        planName={tenant?.subscriptionData?.planName || tenant?.subscription?.planName || "Basic"}
        analytics={analytics}
        isLoading={isAnalyticsLoading}
        hasDataError={Boolean(analyticsError)}
        onUpgrade={handleUpgrade}
        onRetry={refreshAnalytics}
      />
    );
  }

  if (isPrivilegedUser && !hasSubscriptionData) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-900">
        <h2 className="text-lg font-semibold">Unable to load subscription details</h2>
        <p className="mt-1 text-sm text-red-700">
          Analytics access could not be resolved because the tenant subscription data is unavailable.
          Retry to refresh your session.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          disabled={isRetrying}
          className="mt-4 inline-flex items-center rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isRetrying ? "Retrying..." : "Retry"}
        </button>
      </div>
    );
  }

  if (isPrivilegedUser && hasAdvancedAnalytics) {
    return (
      <AnalyticsAdvanced
        analytics={analytics}
        isLoading={isAnalyticsLoading}
        hasDataError={Boolean(analyticsError)}
        onRetry={refreshAnalytics}
      />
    );
  }

  return (
    <AnalyticsStandard
      canUpgrade={isPrivilegedUser}
      planName={tenant?.subscriptionData?.planName || tenant?.subscription?.planName || "Basic"}
      analytics={analytics}
      isLoading={isAnalyticsLoading}
      hasDataError={Boolean(analyticsError)}
      onUpgrade={handleUpgrade}
      onRetry={refreshAnalytics}
    />
  );
};

export default AnalyticsPage;
