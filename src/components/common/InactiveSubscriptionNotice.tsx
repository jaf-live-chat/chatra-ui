import { AlertCircle, History, RefreshCw } from "lucide-react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";

type InactiveSubscriptionNoticeProps = {
  title?: string;
  description?: string;
  reason?: string;
  showHistoryAction?: boolean;
};

const InactiveSubscriptionNotice = ({
  title = "Subscription Inactive",
  description = "Your current plan no longer allows this feature. You can still view chat history.",
  reason,
  showHistoryAction = true,
}: InactiveSubscriptionNoticeProps) => {
  const navigate = useNavigate();
  const { tenant } = useAuth();
  const tenantId = String(tenant?.id || "").trim();

  const handleCheckSubscription = () => {
    if (tenantId) {
      navigate(`/portal/tenants/${tenantId}`);
      return;
    }

    navigate("/portal");
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-amber-900 dark:text-amber-200">{title}</h2>
          <p className="mt-1 text-sm text-amber-800/90 dark:text-amber-300/90">{description}</p>
          {reason ? (
            <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300/80">Reason: {reason}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {showHistoryAction ? (
              <Button
                size="small"
                variant="contained"
                startIcon={<History className="h-4 w-4" />}
                onClick={() => navigate("/portal/chat-sessions?tab=chat-history")}
              >
                View chat history
              </Button>
            ) : null}
            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshCw className="h-4 w-4" />}
              onClick={handleCheckSubscription}
            >
              Check subscription
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InactiveSubscriptionNotice;
