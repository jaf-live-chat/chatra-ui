import PageTitle from "../../../components/common/PageTitle";
import useAuth from "../../../hooks/useAuth";
import useGetRole from "../../../hooks/useGetRole";
import AdvancedDashboard from "./AdvancedDashboard";
import StandardDashboard from "./StandardDashboard";

const DashboardPage = () => {
  const { tenant } = useAuth();
  const { isAdmin, isMasterAdmin, isSupportAgent } = useGetRole();
  const hasAdvancedAnalytics = Boolean(
    tenant?.subscriptionData?.configuration?.limits?.hasAdvancedAnalytics,
  );

  const shouldShowAdvancedDashboard =
    (isAdmin || isMasterAdmin) && hasAdvancedAnalytics;

  return (
    <>
      <PageTitle
        title="Dashboard"
        description="A live operational dashboard for chats, queue pressure, agent activity, and analytics."
        canonical="/portal/dashboard"
      />

      {isSupportAgent ? (
        <StandardDashboard />
      ) : shouldShowAdvancedDashboard ? (
        <AdvancedDashboard />
      ) : (
        <StandardDashboard />
      )}
    </>
  );
};

export default DashboardPage;
