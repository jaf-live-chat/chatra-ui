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

const EMPTY_LABEL = "-";

const getDaysRemaining = (rawDate: string): string => {
  if (!rawDate) return EMPTY_LABEL;

  const endDate = new Date(rawDate);
  if (Number.isNaN(endDate.getTime())) return EMPTY_LABEL;

  const now = new Date();
  const diffInMs = endDate.getTime() - now.getTime();
  const days = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Ends today";
  return `${days} days left`;
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
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Stack spacing={0.6}>
          <Button
            variant="text"
            sx={{ px: 0, alignSelf: "flex-start" }}
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate("/portal/tenants")}
          >
            Back to Tenants
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "grey.900" }}>
            Tenant Details
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Master admin subscription controls and tenant identity details.
          </Typography>
        </Stack>

        {!isLoading && tenant && isMasterAdmin && (
          <Button
            variant="contained"
            startIcon={<ReceiptText size={16} />}
            onClick={() => navigate(`/portal/subscription-plans?tenantId=${tenant.id}`)}
            sx={{ borderRadius: 1, fontWeight: 700 }}
          >
            Change Plan
          </Button>
        )}
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
              p: 3,
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 1,
              background: "linear-gradient(135deg, #0891b210 0%, #0891b204 100%)",
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1,
                    bgcolor: "#0891b220",
                    color: "#0e7490",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building2 size={22} />
                </Box>
                <Box>
                  {isLoading ? (
                    <>
                      <Skeleton width={220} height={32} />
                      <Skeleton width={140} height={18} />
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "grey.900", lineHeight: 1.2 }}>
                        {tenant?.name || EMPTY_LABEL}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        Tenant ID: {tenant?.id || EMPTY_LABEL}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        Company Code: {tenant?.companyCode || EMPTY_LABEL}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        Database: {tenant?.databaseName || EMPTY_LABEL}
                      </Typography>
                    </>
                  )}
                </Box>
              </Stack>

              <Box>
                {isLoading ? (
                  <Skeleton width={120} height={30} />
                ) : (
                  <Chip
                    icon={<Circle size={8} className="fill-current" />}
                    label={currentStatus.label}
                    size="small"
                    sx={{
                      bgcolor: currentStatus.bg,
                      color: currentStatus.color,
                      fontWeight: 700,
                      borderRadius: 1,
                      "& .MuiChip-icon": { color: "inherit", ml: 1 },
                    }}
                  />
                )}
              </Box>
            </Stack>
          </Paper>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 2.5,
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 1,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <CreditCard size={16} color="#0e7490" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "grey.900" }}>
                  Subscription
                </Typography>
              </Stack>

              <Stack spacing={1.8}>
                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Plan
                  </Typography>
                  {isLoading ? (
                    <Skeleton width={140} height={26} />
                  ) : (
                    <Typography variant="body1" sx={{ color: "grey.900", fontWeight: 700 }}>
                      {tenant?.subscription.planName || EMPTY_LABEL}
                    </Typography>
                  )}
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Start Date
                    </Typography>
                    {isLoading ? (
                      <Skeleton width={120} height={24} />
                    ) : (
                      <Typography variant="body2" sx={{ color: "grey.900", fontWeight: 600 }}>
                        {formatDate(tenant?.subscription.startDate || "", { isIncludeTime: true })}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      End Date
                    </Typography>
                    {isLoading ? (
                      <Skeleton width={120} height={24} />
                    ) : (
                      <Typography variant="body2" sx={{ color: "grey.900", fontWeight: 600 }}>
                        {formatDate(tenant?.subscription.endDate || "", { isIncludeTime: true })}
                      </Typography>
                    )}
                  </Box>
                </Stack>

                {!isLoading && (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Subscription ID
                      </Typography>
                      <Typography variant="body2" sx={{ color: "grey.900", fontWeight: 600 }}>
                        {tenant?.subscription.id || EMPTY_LABEL}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Time Remaining
                      </Typography>
                      <Typography variant="body2" sx={{ color: "grey.900", fontWeight: 600 }}>
                        {getDaysRemaining(tenant?.subscription.endDate || "")}
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 2.5,
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 1,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <CalendarClock size={16} color="#0e7490" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "grey.900" }}>
                  Lifecycle Snapshot
                </Typography>
              </Stack>

              {isLoading ? (
                <Stack spacing={1.2}>
                  <Skeleton width="80%" height={22} />
                  <Skeleton width="60%" height={22} />
                  <Skeleton width="72%" height={22} />
                </Stack>
              ) : (
                <Stack spacing={1.2}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Status:
                    <Typography component="span" variant="body2" sx={{ color: "grey.900", fontWeight: 700, ml: 0.8 }}>
                      {currentStatus.label}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Active window:
                    <Typography component="span" variant="body2" sx={{ color: "grey.900", fontWeight: 700, ml: 0.8 }}>
                      {formatDate(tenant?.subscription.startDate || "", { isIncludeTime: true })} to {formatDate(tenant?.subscription.endDate || "", { isIncludeTime: true })}
                    </Typography>
                  </Typography>
                </Stack>
              )}
            </Paper>
          </Stack>

          {isMasterAdmin && !isLoading && tenant && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "grey.900", mb: 0.5 }}>
                Manage Subscription
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                Master admin controls: deactivate the tenant subscription or adjust the end date by days.
              </Typography>

              <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems={{ xs: "stretch", lg: "flex-end" }}>
                <TextField
                  label="Adjust End Date (Days)"
                  type="number"
                  value={adjustmentDays}
                  onChange={(event) => setAdjustmentDays(event.target.value)}
                  size="small"
                  sx={{ minWidth: { xs: "100%", sm: 260 } }}
                  helperText={
                    tenant.subscription.endDate
                      ? "Use positive number to extend, negative number to shorten."
                      : "No end date available to adjust for this subscription."
                  }
                  disabled={isMutating}
                />

                <Button
                  variant="contained"
                  onClick={handleAdjustEndDate}
                  disabled={isMutating || isAdjustActionDisabled}
                  sx={{ borderRadius: 1, fontWeight: 700, minWidth: 160 }}
                >
                  {isMutating ? <CircularProgress size={16} color="inherit" /> : "Apply Day Adjustment"}
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Power size={16} />}
                  onClick={() => setIsDeactivateDialogOpen(true)}
                  disabled={isMutating}
                  sx={{ borderRadius: 1, fontWeight: 700, minWidth: 145 }}
                >
                  Deactivate
                </Button>
              </Stack>
            </Paper>
          )}
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
    </Box>
  );
};

export default TenantDetailsView;
