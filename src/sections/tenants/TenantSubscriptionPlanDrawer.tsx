import { CheckCircle2, CreditCard } from "lucide-react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { useMemo } from "react";
import { useGetSinglePlan } from "../../services/subscriptionPlanServices";
import formatAmount from "../../utils/amountFormatter";
import { formatDate } from "../../utils/dateFormatter";
import idLabel from "../../utils/idUtils";

interface SubscriptionMeta {
  id?: string;
  planId?: string;
  planName?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

interface TenantSubscriptionPlanDrawerProps {
  open: boolean;
  planId?: string;
  subscriptionMeta?: SubscriptionMeta | null;
  contextLabel?: string;
  onClose: () => void;
}

const cycleLabels: Record<string, string> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
};

const toBillingLabel = (billingCycle?: string, interval?: number) => {
  const cycle = String(billingCycle || "monthly").toLowerCase();
  const normalizedInterval = Number(interval) || 1;
  const unit = cycleLabels[cycle] || "month";

  if (normalizedInterval === 1) {
    return `Every ${unit}`;
  }

  return `Every ${normalizedInterval} ${unit}s`;
};

const formatLimitValue = (value?: number) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return "-";
  if (parsed >= 999999) return "Unlimited";
  return String(parsed);
};

const formatBooleanLimitValue = (value?: boolean) => {
  if (typeof value !== "boolean") return "-";
  return value ? "Enabled" : "Disabled";
};

const TenantSubscriptionPlanDrawer = ({
  open,
  planId,
  subscriptionMeta,
  contextLabel,
  onClose,
}: TenantSubscriptionPlanDrawerProps) => {
  const { plan, isLoading, error } = useGetSinglePlan(planId);

  const orderedFeatures = useMemo(() => {
    return Array.isArray(plan?.features) ? plan.features.filter(Boolean) : [];
  }, [plan?.features]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 500 } } }}>
      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
              Subscription Plan Details
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Snapshot of the {contextLabel || "selected"} plan and subscription metadata.
            </Typography>
          </Stack>

          <IconButton onClick={onClose} aria-label="Close subscription plan drawer">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        {!planId && (
          <Alert severity="warning">No subscription plan is linked to this tenant yet.</Alert>
        )}

        {Boolean(planId) && isLoading && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }} spacing={1.5}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Loading subscription plan...
            </Typography>
          </Stack>
        )}

        {Boolean(planId) && Boolean(error) && !isLoading && (
          <Alert severity="error">Failed to load subscription plan details.</Alert>
        )}

        {Boolean(planId) && !isLoading && !error && plan && (
          <Stack spacing={2.4} sx={{ overflowY: "auto", pr: 0.5 }}>
            {subscriptionMeta && (
              <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "grey.50" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 1.2 }}>
                  Subscription Metadata
                </Typography>

                <Stack spacing={0.8}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Subscription ID:{" "}
                    <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
                      {idLabel(subscriptionMeta.id || "", "SUBSCRIPTION")}
                    </Box>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Status:{" "}
                    <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
                      {subscriptionMeta.status || "-"}
                    </Box>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Plan Name:{" "}
                    <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
                      {subscriptionMeta.planName || "-"}
                    </Box>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Start Date:{" "}
                    <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
                      {formatDate(subscriptionMeta.startDate || "", { isIncludeTime: true })}
                    </Box>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    End Date:{" "}
                    <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
                      {formatDate(subscriptionMeta.endDate || "", { isIncludeTime: true })}
                    </Box>
                  </Typography>
                </Stack>
              </Box>
            )}

            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.6 }}>
                <CreditCard size={16} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {plan.name}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {plan.description || "-"}
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Chip
                color="primary"
                variant="outlined"
                label={formatAmount(Number(plan.price || 0))}
                sx={{ fontWeight: 700, borderRadius: 1 }}
              />
              <Chip label={toBillingLabel(plan.billingCycle, plan.interval)} sx={{ borderRadius: 1, fontWeight: 600 }} />
              <Chip
                label={plan.isPosted ? "Published" : "Hidden from pricing"}
                color={plan.isPosted ? "success" : "default"}
                sx={{ borderRadius: 1, fontWeight: 600 }}
              />
              <Chip
                label={plan.isMostPopular ? "Most Popular" : "Standard"}
                color={plan.isMostPopular ? "warning" : "default"}
                sx={{ borderRadius: 1, fontWeight: 600 }}
              />
            </Stack>

            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.03em" }}>
                PLAN ID
              </Typography>
              <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                {idLabel(plan._id, 'PLAN') || "-"}
              </Typography>
            </Box>

            <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 1.2 }}>
                Limits
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Max Agents:{" "}
                  <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
                    {formatLimitValue(plan.limits?.maxAgents)}
                  </Box>
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Advanced Analytics:{" "}
                  <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
                    {formatBooleanLimitValue(plan.limits?.hasAdvancedAnalytics)}
                  </Box>
                </Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 1.1 }}>
                Features
              </Typography>

              {!orderedFeatures.length && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  No features configured.
                </Typography>
              )}

              {orderedFeatures.length > 0 && (
                <Stack spacing={0.9}>
                  {orderedFeatures.map((feature) => (
                    <Stack key={feature} direction="row" alignItems="flex-start" spacing={0.9}>
                      <CheckCircle2 size={16} />
                      <Typography variant="body2" sx={{ color: "text.primary" }}>
                        {feature}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
};

export default TenantSubscriptionPlanDrawer;
