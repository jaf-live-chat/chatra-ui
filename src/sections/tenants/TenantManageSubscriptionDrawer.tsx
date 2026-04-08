import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Settings2 } from "lucide-react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Calendar from "../../components/calendar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { format, isValid } from "date-fns";
import { useGetSubscriptionPlans, type SubscriptionPlanApiModel } from "../../services/subscriptionPlanServices";
import tenantService from "../../services/tenantService";
import type { Tenant } from "../../models/TenantModel";
import { formatDate } from "../../utils/dateFormatter";

interface TenantManageSubscriptionDrawerProps {
  open: boolean;
  tenant: Tenant | null;
  onClose: () => void;
  onSaved?: () => Promise<void> | void;
}

const toPlanPriceLabel = (price?: number) => {
  const parsedPrice = Number(price || 0);

  if (parsedPrice <= 0) {
    return "Free";
  }

  return `₱${parsedPrice.toLocaleString()}`;
};

const parseAsLocalCalendarDate = (value: string) => {
  const trimmed = value.trim();
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);

  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const monthIndex = Number(dateOnlyMatch[2]) - 1;
    const day = Number(dateOnlyMatch[3]);
    return new Date(year, monthIndex, day);
  }

  const parsed = new Date(trimmed);
  if (!isValid(parsed)) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const TenantManageSubscriptionDrawer = ({ open, tenant, onClose, onSaved }: TenantManageSubscriptionDrawerProps) => {
  const { plans, isLoading, error } = useGetSubscriptionPlans();
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(undefined);
  const [endDateAnchorEl, setEndDateAnchorEl] = useState<HTMLElement | null>(null);
  const [isUpdatingEndDate, setIsUpdatingEndDate] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [feedback, setFeedback] = useState<{ severity: "success" | "error"; message: string } | null>(null);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan._id === selectedPlanId) || null,
    [plans, selectedPlanId],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedPlanId(tenant?.subscription.planId || "");
    const nextSelectedEndDate = parseAsLocalCalendarDate(tenant?.subscription.endDate || "");

    setSelectedEndDate(nextSelectedEndDate);
    setCalendarMonth(nextSelectedEndDate || undefined);
    setEndDateAnchorEl(null);
    setFeedback(null);
  }, [open, tenant?.subscription.planId]);

  const planOptions = useMemo(() => plans.filter(Boolean), [plans]);

  const showFeedback = (message: string, severity: "success" | "error") => {
    setFeedback({ message, severity });
  };

  const handleAdjustEndDate = async () => {
    if (!tenant?.id) {
      showFeedback("Tenant information is missing.", "error");
      return;
    }

    if (!selectedEndDate || !isValid(selectedEndDate)) {
      showFeedback("Pick a valid end date.", "error");
      return;
    }

    setIsUpdatingEndDate(true);
    setFeedback(null);

    try {
      await tenantService.manageTenantSubscription(tenant.id, {
        action: "SET_END_DATE",
        endDate: format(selectedEndDate, "yyyy-MM-dd"),
      });

      await onSaved?.();
      showFeedback("Subscription end date updated successfully.", "success");
    } catch (requestError) {
      console.error("Failed to update tenant subscription end date", requestError);
      showFeedback("Failed to update the subscription end date.", "error");
    } finally {
      setIsUpdatingEndDate(false);
    }
  };

  const handleApplyPlan = async () => {
    if (!tenant?.id || !selectedPlanId) {
      showFeedback("Select a subscription plan first.", "error");
      return;
    }

    setIsUpdatingPlan(true);
    setFeedback(null);

    try {
      await tenantService.manageTenantSubscription(tenant.id, {
        action: "CHANGE_PLAN",
        subscriptionPlanId: selectedPlanId,
      });

      await onSaved?.();
      showFeedback("Subscription plan updated successfully.", "success");
    } catch (requestError) {
      console.error("Failed to update tenant subscription plan", requestError);
      showFeedback("Failed to update the subscription plan.", "error");
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 620 } } }}
    >
      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
              Manage subscription
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Adjust the active subscription end date or move the tenant to another plan.
            </Typography>
          </Stack>

          <IconButton onClick={onClose} aria-label="Close manage subscription drawer">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        {tenant && (
          <Card variant="outlined" sx={{ mb: 2.5, borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Settings2 size={16} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Current subscription
                  </Typography>
                </Stack>
                <Chip label={tenant.subscription.status || "-"} size="small" sx={{ borderRadius: 1, fontWeight: 600 }} />
              </Stack>

              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {tenant.subscription.planName || "-"} is active until {formatDate(tenant.subscription.endDate || "", { isIncludeTime: true })}.
              </Typography>

              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
                Tenant ID: <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{tenant.id}</Box>
              </Typography>

              {tenant.upcomingSubscription?.planName && (
                <Alert severity="info" sx={{ mt: 1.5 }}>
                  Scheduled plan: {tenant.upcomingSubscription.planName} starts on {formatDate(tenant.upcomingSubscription.startDate, { isIncludeTime: true })}.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {Boolean(error) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load subscription plans.
          </Alert>
        )}

        {Boolean(feedback) && (
          <Alert severity={feedback?.severity || "info"} sx={{ mb: 2 }}>
            {feedback?.message}
          </Alert>
        )}

        <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
          <Stack spacing={3}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarDays size={16} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Update end date
                    </Typography>
                  </Stack>

                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Choose the new subscription end date from the calendar.
                  </Typography>

                  <Button
                    variant="outlined"
                    startIcon={<CalendarDays size={16} />}
                    sx={{ justifyContent: "space-between", px: 1.5, py: 1.2 }}
                    fullWidth
                    onClick={(event) => {
                      const nextSelectedEndDate = parseAsLocalCalendarDate(tenant?.subscription.endDate || "");

                      setSelectedEndDate(nextSelectedEndDate);
                      setCalendarMonth(nextSelectedEndDate || undefined);
                      setEndDateAnchorEl(event.currentTarget);
                    }}
                  >
                    {selectedEndDate ? format(selectedEndDate, "PPP") : "Pick end date"}
                  </Button>

                  <Popover
                    open={Boolean(endDateAnchorEl)}
                    anchorEl={endDateAnchorEl}
                    onClose={() => setEndDateAnchorEl(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                    PaperProps={{ sx: { mt: 1, borderRadius: 2, overflow: "hidden" } }}
                  >
                    <Calendar
                      mode="single"
                      selected={selectedEndDate || undefined}
                      month={calendarMonth}
                      onMonthChange={setCalendarMonth}
                      onSelect={(date) => {
                        setSelectedEndDate(date || null);
                        setCalendarMonth(date || undefined);
                        setEndDateAnchorEl(null);
                      }}
                      initialFocus
                    />
                  </Popover>

                  <Button
                    variant="contained"
                    onClick={handleAdjustEndDate}
                    disabled={isUpdatingEndDate}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    {isUpdatingEndDate ? <CircularProgress size={16} color="inherit" /> : "Update end date"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ArrowRight size={16} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Change subscription plan
                    </Typography>
                  </Stack>

                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Choose a new plan and apply it immediately to the tenant.
                  </Typography>

                  {isLoading && (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }} spacing={1.5}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Loading subscription plans...
                      </Typography>
                    </Stack>
                  )}

                  {!isLoading && !error && planOptions.length > 0 && (
                    <Stack spacing={1.5}>
                      <TextField
                        select
                        label="Subscription plan"
                        value={selectedPlanId}
                        onChange={(event) => setSelectedPlanId(event.target.value)}
                        fullWidth
                      >
                        {planOptions.map((plan: SubscriptionPlanApiModel) => (
                          <MenuItem key={plan._id} value={plan._id}>
                            {plan.name} - {toPlanPriceLabel(plan.price)}
                          </MenuItem>
                        ))}
                      </TextField>

                      {selectedPlan && (
                        <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.6 }}>
                            Selected plan
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.primary" }}>
                            {selectedPlan.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                            {selectedPlan.description || "No description available."}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1.2, flexWrap: "wrap" }} useFlexGap>
                            <Chip label={toPlanPriceLabel(selectedPlan.price)} variant="outlined" sx={{ borderRadius: 1, fontWeight: 600 }} />
                            <Chip label={`${selectedPlan.billingCycle} / ${selectedPlan.interval}`} sx={{ borderRadius: 1, fontWeight: 600 }} />
                          </Stack>
                        </Box>
                      )}

                      <Button
                        variant="contained"
                        onClick={handleApplyPlan}
                        disabled={isUpdatingPlan || !selectedPlanId}
                        sx={{ alignSelf: "flex-start" }}
                      >
                        {isUpdatingPlan ? <CircularProgress size={16} color="inherit" /> : "Apply plan"}
                      </Button>
                    </Stack>
                  )}

                  {!isLoading && !error && planOptions.length === 0 && (
                    <Alert severity="warning">No subscription plans are available right now.</Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default TenantManageSubscriptionDrawer;
