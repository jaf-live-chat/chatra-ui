import { useMemo, useState } from "react";
import { ArrowRight, CalendarClock, CreditCard } from "lucide-react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useGetSubscriptionPlans, type SubscriptionPlanApiModel } from "../../services/subscriptionPlanServices";
import Payments from "../../services/paymentServices";
import type { Tenant } from "../../models/TenantModel";
import formatAmount from "../../utils/amountFormatter";
import { formatDate } from "../../utils/dateFormatter";

interface TenantPlanChangeDrawerProps {
  open: boolean;
  tenant: Tenant | null;
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

const toPriceLabel = (price?: number) => {
  const parsedPrice = Number(price || 0);

  if (parsedPrice <= 0) {
    return "Free";
  }

  return formatAmount(parsedPrice);
};

const isPaidPlan = (price?: number) => Number(price || 0) > 0;

const TenantPlanChangeDrawer = ({ open, tenant, onClose }: TenantPlanChangeDrawerProps) => {
  const { plans, isLoading, error } = useGetSubscriptionPlans();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanApiModel | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  const currentPlanId = tenant?.subscription.planId || "";
  const currentPlanName = tenant?.subscription.planName || "Current plan";
  const upcomingPlanName = tenant?.upcomingSubscription?.planName || "";

  const availablePlans = useMemo(
    () => plans.filter((plan) => plan && plan._id && isPaidPlan(plan.price)),
    [plans],
  );

  const selectedPlanPriceLabel = selectedPlan ? toPriceLabel(selectedPlan.price) : "";
  const selectedPlanFeatureList = useMemo(
    () => (selectedPlan?.features || []).filter(Boolean),
    [selectedPlan?.features],
  );

  const openPlanPreview = (plan: SubscriptionPlanApiModel) => {
    setSelectedPlan(plan);
    setFeedback("");
    setIsPreviewOpen(true);
  };

  const closePlanPreview = () => {
    if (isSubmitting) return;
    setIsPreviewOpen(false);
  };

  const closeConfirmDialog = () => {
    if (isSubmitting) return;
    setIsConfirmOpen(false);
  };

  const handlePlanChange = async () => {
    if (!tenant?.id || !selectedPlan) {
      setFeedback("Tenant information is missing.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");
    setIsConfirmOpen(false);
    setIsPreviewOpen(false);

    try {
      const response = await Payments.createCheckout({
        subscriptionData: {
          companyName: tenant.name,
          companyCode: tenant.companyCode || "",
          subscriptionPlanId: selectedPlan._id,
          subscriptionStart: new Date().toISOString(),
          tenantId: tenant.id,
          currentSubscriptionId: tenant.subscription.id,
        },
      });

      if (response.checkoutUrl) {
        window.location.assign(response.checkoutUrl);
        return;
      }

      setFeedback(response.message || "The plan change was applied successfully.");
    } catch (requestError) {
      const errorMessage = requestError instanceof Error ? requestError.message : "Unable to start checkout.";
      setFeedback(errorMessage);
    } finally {
      setIsSubmitting(false);
      setSelectedPlan(null);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 550 } } }}
    >
      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
              Change subscription plan
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Pay for the new plan and activate it immediately.
            </Typography>
          </Stack>

          <IconButton onClick={onClose} aria-label="Close plan change drawer">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        {tenant?.upcomingSubscription?.planName && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Upcoming plan: {upcomingPlanName} will start on {formatDate(tenant.upcomingSubscription.startDate, { isIncludeTime: true })}.
          </Alert>
        )}

        <Card variant="outlined" sx={{ mb: 2.5, borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <CreditCard size={16} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Current subscription
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {currentPlanName} remains active until {formatDate(tenant?.subscription.endDate || "", { isIncludeTime: true })}.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }} useFlexGap>
              <Chip label={tenant?.subscription.planName || "-"} sx={{ borderRadius: 1, fontWeight: 600 }} />
              <Chip label={tenant?.subscription.status || "-"} color="primary" variant="outlined" sx={{ borderRadius: 1, fontWeight: 600 }} />
            </Stack>
          </CardContent>
        </Card>

        {Boolean(error) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load subscription plans.
          </Alert>
        )}

        {Boolean(feedback) && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {feedback}
          </Alert>
        )}

        <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
          {isLoading && (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }} spacing={1.5}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Loading subscription plans...
              </Typography>
            </Stack>
          )}

          {!isLoading && !error && availablePlans.length === 0 && (
            <Alert severity="warning">No purchasable plans are available right now.</Alert>
          )}

          {!isLoading && !error && availablePlans.length > 0 && (
            <Stack spacing={1.5}>
              {availablePlans.map((plan) => {
                const isCurrentPlan = plan._id === currentPlanId;

                return (
                  <Card
                    key={plan._id}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      borderColor: isCurrentPlan ? "primary.main" : "divider",
                      bgcolor: isCurrentPlan ? "primary.50" : "background.paper",
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                        <Box>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.8 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              {plan.name}
                            </Typography>
                            {isCurrentPlan && <Chip label="Current" size="small" color="primary" sx={{ borderRadius: 1 }} />}
                          </Stack>
                          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.2 }}>
                            {plan.description || "Subscription plan"}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }} useFlexGap>
                            <Chip
                              label={toPriceLabel(plan.price)}
                              color="primary"
                              variant="outlined"
                              sx={{ borderRadius: 1, fontWeight: 700 }}
                            />
                            <Chip label={toBillingLabel(plan.billingCycle, plan.interval)} sx={{ borderRadius: 1, fontWeight: 600 }} />
                          </Stack>
                        </Box>

                        <Button
                          variant={isCurrentPlan ? "outlined" : "contained"}
                          onClick={() => openPlanPreview(plan)}
                          disabled={isSubmitting}
                          endIcon={<ArrowRight size={14} />}
                          sx={{ minWidth: 150, borderRadius: 1, fontWeight: 700 }}
                        >
                          {isCurrentPlan ? "Renew plan" : "View plan"}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>

        <Box sx={{ pt: 2.5 }}>
          <Alert severity="warning" icon={<CalendarClock size={16} />}>
            After successful payment, the current plan will be replaced immediately.
          </Alert>
        </Box>

        <Dialog open={isPreviewOpen} onClose={closePlanPreview} fullWidth maxWidth="sm">
          <DialogTitle sx={{ pb: 1.2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {selectedPlan?.name || "Plan preview"}
              </Typography>
              <Chip label={selectedPlan?._id === currentPlanId ? "Current plan" : "New plan"} size="small" color="primary" sx={{ borderRadius: 1 }} />
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {selectedPlan?.description || "Subscription plan"}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }} useFlexGap>
                <Chip label={selectedPlanPriceLabel} color="primary" variant="outlined" sx={{ borderRadius: 1, fontWeight: 700 }} />
                <Chip label={selectedPlan ? toBillingLabel(selectedPlan.billingCycle, selectedPlan.interval) : ""} sx={{ borderRadius: 1, fontWeight: 600 }} />
              </Stack>

              {selectedPlanFeatureList.length > 0 && (
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50", border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    What you get
                  </Typography>
                  <Stack spacing={0.9}>
                    {selectedPlanFeatureList.map((feature) => (
                      <Typography key={feature} variant="body2" sx={{ color: "text.primary" }}>
                        • {feature}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                This payment activates the selected plan right away and replaces the current subscription.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={closePlanPreview} disabled={isSubmitting}>
              Back
            </Button>
            <Button variant="contained" onClick={() => setIsConfirmOpen(true)} disabled={!selectedPlan || isSubmitting}>
              Continue to payment
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={isConfirmOpen} onClose={closeConfirmDialog} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 800 }}>Confirm payment</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Continue to payment for {selectedPlan?.name || "this plan"}? The current subscription will be replaced immediately after payment success.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={closeConfirmDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handlePlanChange} disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={16} color="inherit" /> : "Continue to payment"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Drawer>
  );
};

export default TenantPlanChangeDrawer;
