import { CheckCircle2, CreditCard, Clock, Package } from "lucide-react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

interface TenantSubscriptionAccordionProps {
  planId?: string;
  subscriptionMeta?: SubscriptionMeta | null;
  contextLabel?: string;
  defaultExpanded?: boolean;
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

const TenantSubscriptionAccordion = ({
  planId,
  subscriptionMeta,
  contextLabel = "Current Subscription",
  defaultExpanded = false,
}: TenantSubscriptionAccordionProps) => {
  const { plan, isLoading, error } = useGetSinglePlan(planId);

  const orderedFeatures = useMemo(() => {
    return Array.isArray(plan?.features) ? plan.features.filter(Boolean) : [];
  }, [plan?.features]);

  if (!planId) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 1 }}>
        No subscription plan is linked to this tenant yet.
      </Alert>
    );
  }

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      sx={{
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:before": {
          display: "none",
        },
        "&.Mui-expanded": {
          margin: "0",
        },
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="subscription-details-panel"
        id="subscription-details-header"
        sx={{
          py: 2,
          px: 2.5,
          transition: "all 0.3s ease",
          "&:hover": {
            bgcolor: "action.hover",
          },
          "&.Mui-expanded": {
            bgcolor: "primary.50",
          },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ width: "100%", pr: 1 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              borderRadius: "10px",
              bgcolor: "primary.50",
              color: "primary.main",
            }}
          >
            <CreditCard size={20} />
          </Box>

          <Stack spacing={0.4} sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {isLoading ? "Loading..." : plan?.name || "Plan Details"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              {contextLabel}
            </Typography>
          </Stack>

          {!isLoading && plan && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                flexWrap: "wrap",
                justifyContent: { xs: "flex-start", sm: "flex-end" }
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "primary.main" }}
                >
                  {formatAmount(Number(plan.price || 0))}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 500 }}
                >
                  {toBillingLabel(plan.billingCycle, plan.interval)}
                </Typography>
              </Box>
            </Stack>
          )}
        </Stack>
      </AccordionSummary>

      <Divider sx={{ my: 0 }} />

      <AccordionDetails
        sx={{
          p: 0,
          bgcolor: "background.paper",
        }}
      >
        {isLoading && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }} spacing={1.5}>
            <CircularProgress size={32} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Loading subscription plan details...
            </Typography>
          </Stack>
        )}

        {error && !isLoading && (
          <Box sx={{ p: 2.5 }}>
            <Alert severity="error" sx={{ borderRadius: 1 }}>
              Failed to load subscription plan details.
            </Alert>
          </Box>
        )}

        {!isLoading && !error && plan && (
          <Stack spacing={0}>
            {subscriptionMeta && (
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: "primary.50",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack spacing={1.8}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Clock size={16} color="currentColor" />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      SUBSCRIPTION DETAILS
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.5,
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: "text.secondary", letterSpacing: "0.03em" }}
                      >
                        ID
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.4, color: "text.primary", fontWeight: 600, wordBreak: "break-word" }}
                      >
                        {idLabel(subscriptionMeta.id || "", "SUBSCRIPTION")}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: "text.secondary", letterSpacing: "0.03em" }}
                      >
                        STATUS
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.4, color: "text.primary", fontWeight: 600 }}
                      >
                        {subscriptionMeta.status || "-"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: "text.secondary", letterSpacing: "0.03em" }}
                      >
                        START DATE
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.4, color: "text.primary", fontWeight: 600 }}
                      >
                        {formatDate(subscriptionMeta.startDate || "", { isIncludeTime: true })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: "text.secondary", letterSpacing: "0.03em" }}
                      >
                        END DATE
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.4, color: "text.primary", fontWeight: 600 }}
                      >
                        {formatDate(subscriptionMeta.endDate || "", { isIncludeTime: true })}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            )}

            <Box sx={{ p: 2.5 }}>
              <Stack spacing={3}>
                {/* Description */}
                {plan.description && (
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", lineHeight: 1.6 }}
                    >
                      {plan.description}
                    </Typography>
                  </Box>
                )}

                {/* Plan Info Cards */}
                <Box
                  sx={{
                    display: "grid",
                    gap: 1.2,
                    gridTemplateColumns: { xs: "1fr", sm: "auto auto" },
                  }}
                >
                  <Chip
                    icon={<CreditCard size={14} />}
                    label={formatAmount(Number(plan.price || 0))}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700, height: "auto", py: 0.8, borderRadius: 1, "& .MuiChip-icon": { color: "inherit" } }}
                  />
                  <Chip
                    icon={<Clock size={14} />}
                    label={toBillingLabel(plan.billingCycle, plan.interval)}
                    variant="filled"
                    sx={{ height: "auto", py: 0.8, borderRadius: 1, fontWeight: 600, "& .MuiChip-icon": { color: "inherit" } }}
                  />
                  <Chip
                    label={plan.isPosted ? "✓ Published" : "Hidden"}
                    color={plan.isPosted ? "success" : "default"}
                    variant="filled"
                    sx={{ height: "auto", py: 0.8, borderRadius: 1, fontWeight: 600 }}
                  />
                  <Chip
                    label={plan.isMostPopular ? "★ Most Popular" : "Standard"}
                    color={plan.isMostPopular ? "warning" : "default"}
                    variant="filled"
                    sx={{ height: "auto", py: 0.8, borderRadius: 1, fontWeight: 600 }}
                  />
                </Box>

                <Divider />

                {/* Plan ID */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: "0.04em" }}
                  >
                    PLAN IDENTIFIER
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.5, color: "text.primary", fontWeight: 600, wordBreak: "break-word" }}
                  >
                    {idLabel(plan._id, "PLAN") || "-"}
                  </Typography>
                </Box>

                <Divider />

                {/* Limits Section */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <Package size={16} color="currentColor" />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: "text.primary" }}
                    >
                      Plan Limits
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack spacing={1}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 0.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          Maximum Agents:
                        </Typography>
                        <Chip
                          label={formatLimitValue(plan.limits?.maxAgents)}
                          size="small"
                          variant="filled"
                          sx={{ fontWeight: 700, minWidth: 80, justifyContent: "center" }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 0.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          Advanced Analytics:
                        </Typography>
                        <Chip
                          label={formatBooleanLimitValue(plan.limits?.hasAdvancedAnalytics)}
                          size="small"
                          color={plan.limits?.hasAdvancedAnalytics ? "success" : "default"}
                          variant="filled"
                          sx={{ fontWeight: 700, minWidth: 80, justifyContent: "center" }}
                        />
                      </Box>
                    </Stack>
                  </Box>
                </Box>

                <Divider />

                {/* Features Section */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "text.primary", mb: 1.5 }}
                  >
                    Plan Features
                  </Typography>

                  {!orderedFeatures.length && (
                    <Box
                      sx={{
                        p: 2,
                        textAlign: "center",
                        bgcolor: "grey.50",
                        borderRadius: 1,
                        border: "1px dashed",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        No features configured for this plan.
                      </Typography>
                    </Box>
                  )}

                  {orderedFeatures.length > 0 && (
                    <Stack
                      spacing={1}
                      sx={{
                        p: 1.5,
                        bgcolor: "success.50",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "success.light",
                      }}
                    >
                      {orderedFeatures.map((feature) => (
                        <Stack
                          key={feature}
                          direction="row"
                          alignItems="flex-start"
                          spacing={1}
                        >
                          <CheckCircle2
                            size={16}
                            style={{
                              marginTop: "2px",
                              flexShrink: 0,
                              color: "hsl(142, 71%, 45%)"
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "text.primary", pt: 0.2 }}
                          >
                            {feature}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>
            </Box>
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default TenantSubscriptionAccordion;
