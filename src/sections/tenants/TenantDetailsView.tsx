import { ArrowLeft, Building2, CalendarClock, Circle, CreditCard, Power, ReceiptText } from "lucide-react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { USER_ROLES } from "../../constants/constants";
import type { TenantStatus } from "../../models/TenantModel";
import { useGetSingleTenant } from "../../services/tenantService";
import tenantService from "../../services/tenantService";
import useAuth from "../../hooks/useAuth";
import { formatDate } from "../../utils/dateFormatter";
import idLabel from "../../utils/idUtils";
import TitleTag from "../../components/TitleTag";
import TenantSubscriptionPlanDrawer from "./TenantSubscriptionPlanDrawer";

const EMPTY_LABEL = "-";

const getDaysRemaining = (rawDate: string): string => {
  if (!rawDate) return EMPTY_LABEL;

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
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  };

  const endDate = parseAsLocalCalendarDate(rawDate);
  if (!endDate) return EMPTY_LABEL;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  const dayDiff = Math.floor((endDate.getTime() - today.getTime()) / msPerDay);

  if (dayDiff < 0) return `${Math.abs(dayDiff)} days overdue`;
  if (dayDiff === 0) return "Ends today";
  return `${dayDiff} days remaining`;
};

const statusMeta: Record<TenantStatus, { label: string; bg: string; color: string }> = {
  ACTIVE: { label: "Active", bg: "#dcfce7", color: "#15803d" },
  INACTIVE: { label: "Inactive", bg: "#fef3c7", color: "#b45309" },
  EXPIRED: { label: "Expired", bg: "#fee2e2", color: "#b91c1c" },
};

type SnackbarSeverity = "success" | "error";

interface FeedbackState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

const defaultFeedbackState: FeedbackState = {
  open: false,
  message: "",
  severity: "success",
};

const TenantDetailsView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { tenant, isLoading, error, mutate } = useGetSingleTenant(id);

  const isMasterAdmin = user?.role === USER_ROLES.MASTER_ADMIN.value;
  const isAdmin = user?.role === USER_ROLES.ADMIN.value;
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isSubscriptionDrawerOpen, setIsSubscriptionDrawerOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [adjustmentDays, setAdjustmentDays] = useState("7");
  const [feedback, setFeedback] = useState<FeedbackState>(defaultFeedbackState);

  const currentStatus = useMemo(() => {
    if (!tenant) return statusMeta.INACTIVE;
    return statusMeta[tenant.subscription.status] || statusMeta.INACTIVE;
  }, [tenant]);

  const isAdjustActionDisabled = useMemo(() => {
    if (!tenant?.subscription.endDate) {
      return true;
    }

    const parsedDays = Number(adjustmentDays);
    return !Number.isInteger(parsedDays) || parsedDays === 0;
  }, [adjustmentDays, tenant?.subscription.endDate]);

  const showFeedback = (message: string, severity: SnackbarSeverity) => {
    setFeedback({ open: true, message, severity });
  };

  const closeFeedback = () => {
    setFeedback((prev) => ({ ...prev, open: false }));
  };

  const refreshTenant = async () => {
    await mutate();
  };

  const handleAdjustEndDate = async () => {
    if (!tenant || !id) return;

    const parsedDays = Number(adjustmentDays);
    if (!Number.isInteger(parsedDays) || parsedDays === 0) {
      showFeedback("Please enter a non-zero whole number of days.", "error");
      return;
    }

    setIsMutating(true);
    try {
      await tenantService.manageTenantSubscription(id, {
        action: "ADJUST_END_DATE",
        days: parsedDays,
      });
      await refreshTenant();
      showFeedback("Subscription end date updated successfully.", "success");
    } catch (actionError) {
      console.error("Failed to adjust tenant subscription end date", actionError);
      showFeedback("Failed to adjust subscription end date.", "error");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeactivateSubscription = async () => {
    if (!tenant || !id) return;

    setIsMutating(true);
    try {
      await tenantService.manageTenantSubscription(id, {
        action: "DEACTIVATE",
      });
      await refreshTenant();
      showFeedback("Tenant subscription deactivated successfully.", "success");
      setIsDeactivateDialogOpen(false);
    } catch (actionError) {
      console.error("Failed to deactivate tenant subscription", actionError);
      showFeedback("Failed to deactivate tenant subscription.", "error");
    } finally {
      setIsMutating(false);
    }
  };

  if (!id) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 1, border: "1px solid", borderColor: "grey.200" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Missing tenant id in route.
        </Alert>
        <Button onClick={() => navigate("/portal/tenants")} startIcon={<ArrowLeft size={16} />}>
          Back to Tenants
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.6}>
            <TitleTag
              title="Tenant Details"
              subtitle="Master admin subscription controls and tenant identity details."
            />
          </Stack>

          {!isLoading && tenant && (isMasterAdmin || isAdmin) && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Button
                variant="outlined"
                startIcon={<CreditCard size={16} />}
                onClick={() => setIsSubscriptionDrawerOpen(true)}
                disabled={!tenant.subscription.planId}
                sx={{ borderRadius: 1, fontWeight: 700, px: 2 }}
              >
                View Subscription
              </Button>

              <Button
                variant="contained"
                startIcon={<ReceiptText size={16} />}
                onClick={() => navigate(`/portal/subscription-plans?tenantId=${tenant.id}`)}
                sx={{ borderRadius: 1, fontWeight: 700, px: 2 }}
              >
                Change Plan
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>

      {Boolean(error) && (
        <Alert severity="error">Failed to load tenant details. Please refresh and try again.</Alert>
      )}

      {!isLoading && !error && !tenant && (
        <Paper
          elevation={0}
          sx={{ p: 4, borderRadius: 1, border: "1px solid", borderColor: "grey.200" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "grey.900", mb: 0.5 }}>
            Tenant not found
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            The tenant may have been removed or the link is invalid.
          </Typography>
          <Button onClick={() => navigate("/portal/tenants")} startIcon={<ArrowLeft size={16} />}>
            Back to Tenants
          </Button>
        </Paper>
      )}

      {(isLoading || tenant) && (
        <>
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: { xs: 2, md: 3 },
                py: 2.5,
                borderBottom: "1px solid",
                borderColor: "grey.200",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              }}
            >
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
                <Stack direction="row" spacing={1.8} alignItems="center">
                  <Box
                    sx={{
                      width: 62,
                      height: 62,
                      borderRadius: 1,
                      bgcolor: "action.hover",
                      color: "primary.main",
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Building2 size={30} />
                  </Box>
                  <Box>
                    {isLoading ? (
                      <>
                        <Skeleton width={220} height={34} />
                        <Skeleton width={360} height={20} />
                      </>
                    ) : (
                      <>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary" }}>
                            {tenant?.name}
                          </Typography>
                          <Chip
                            icon={<Circle size={8} className="fill-current" />}
                            label={currentStatus.label.toUpperCase()}
                            size="small"
                            sx={{
                              height: 26,
                              bgcolor: currentStatus.bg,
                              color: currentStatus.color,
                              fontWeight: 700,
                              borderRadius: 1,
                              "& .MuiChip-label": { px: 1.1, fontSize: "0.72rem", letterSpacing: "0.03em" },
                              "& .MuiChip-icon": { color: "inherit", ml: 1 },
                            }}
                          />
                        </Stack>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 0.2, md: 1.8 }} sx={{ mt: 0.35 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                            ID: {idLabel(tenant?.id || "", "TENANT")}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                            Code: {tenant?.companyCode}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                            DB: {tenant?.databaseName}
                          </Typography>
                        </Stack>
                      </>
                    )}
                  </Box>
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: { xs: "1fr", md: "1.4fr 0.9fr" },
                }}
              >
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <CreditCard size={16} color="currentColor" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "primary.main", letterSpacing: "0.06em" }}>
                      SUBSCRIPTION DETAILS
                    </Typography>
                  </Stack>

                  {isLoading ? (
                    <Stack spacing={1.4}>
                      <Skeleton width="74%" height={28} />
                      <Skeleton width="68%" height={28} />
                      <Skeleton width="82%" height={28} />
                    </Stack>
                  ) : (
                    <Stack spacing={2.1}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.04em" }}>
                            CURRENT PLAN
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.2, color: "text.primary", fontWeight: 600 }}>
                            {tenant?.subscription.planName || EMPTY_LABEL}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.04em" }}>
                            SUBSCRIPTION ID
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.45, color: "text.primary", fontWeight: 600 }}>
                            {idLabel(tenant?.subscription.id || "", "SUBSCRIPTION")}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.04em" }}>
                            START DATE
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.4, color: "text.primary", fontWeight: 600 }}>
                            {formatDate(tenant?.subscription.startDate || "", { isIncludeTime: true })}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.04em" }}>
                            END DATE
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.4, color: "text.primary", fontWeight: 600 }}>
                            {formatDate(tenant?.subscription.endDate || "", { isIncludeTime: true })}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  )}
                </Box>

                <Box
                  sx={{
                    borderLeft: { xs: "none", md: "1px solid" },
                    borderColor: { xs: "transparent", md: "divider" },
                    pl: { xs: 0, md: 3 },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <CalendarClock size={16} color="currentColor" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "primary.main", letterSpacing: "0.06em" }}>
                      LIFECYCLE SNAPSHOT
                    </Typography>
                  </Stack>

                  {isLoading ? (
                    <Stack spacing={1.2}>
                      <Skeleton width="82%" height={24} />
                      <Skeleton width="70%" height={24} />
                      <Skeleton width="100%" height={96} />
                    </Stack>
                  ) : (
                    <Stack spacing={1.8}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.04em" }}>
                          STATUS
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600, display: "flex", alignItems: "center", gap: 0.8 }}>
                          <Circle size={12} style={{ fill: currentStatus.color, color: currentStatus.color }} />
                          {currentStatus.label}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.04em" }}>
                          TIME REMAINING
                        </Typography>
                        <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600 }}>
                          {getDaysRemaining(tenant?.subscription.endDate || "")}
                        </Typography>
                      </Box>

                      <Box sx={{ bgcolor: "grey.50", border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.04em" }}>
                          ACTIVE WINDOW
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.4, color: "text.primary", fontWeight: 600 }}>
                          {formatDate(tenant?.subscription.startDate || "", { isIncludeTime: true })}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                          to
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                          {formatDate(tenant?.subscription.endDate || "", { isIncludeTime: true })}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        </>
      )}

      <Dialog open={isDeactivateDialogOpen} onClose={() => setIsDeactivateDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Deactivate subscription</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will mark the latest subscription as inactive for this tenant. Continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeactivateDialogOpen(false)} disabled={isMutating}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeactivateSubscription} disabled={isMutating}>
            {isMutating ? <CircularProgress size={16} color="inherit" /> : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={feedback.open}
        autoHideDuration={3500}
        onClose={closeFeedback}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeFeedback} severity={feedback.severity} variant="filled" sx={{ width: "100%" }}>
          {feedback.message}
        </Alert>
      </Snackbar>

      <TenantSubscriptionPlanDrawer
        open={isSubscriptionDrawerOpen}
        planId={tenant?.subscription.planId}
        onClose={() => setIsSubscriptionDrawerOpen(false)}
      />
    </Box>
  );
};

export default TenantDetailsView;
