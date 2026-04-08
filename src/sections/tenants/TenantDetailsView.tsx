import { Activity, ArrowLeft, ArrowRight, Building2, CalendarDays, Circle, CreditCard, Hash, ReceiptText, Send, Settings2, UserRound } from "lucide-react";
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
import TenantPlanChangeDrawer from "./TenantPlanChangeDrawer";
import TenantManageSubscriptionDrawer from "./TenantManageSubscriptionDrawer";

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
  return `${dayDiff} days left`;
};

const statusMeta: Record<TenantStatus, { label: string; bg: string; color: string }> = {
  ACTIVE: { label: "Active", bg: "#dcfce7", color: "#15803d" },
  INACTIVE: { label: "Inactive", bg: "#fef3c7", color: "#b45309" },
  EXPIRED: { label: "Expired", bg: "#fee2e2", color: "#b91c1c" },
  DEACTIVATED: { label: "Deactivated", bg: "#ffedd5", color: "#c2410c" },
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

const LIGHT_SURFACE_TEXT_PRIMARY = "#0f172a";
const LIGHT_SURFACE_TEXT_SECONDARY = "#64748b";
const HEADER_TEXT_PRIMARY = "#ffffff";
const HEADER_TEXT_SECONDARY = "#cbd5e1";

interface DrawerSubscriptionMeta {
  id?: string;
  planId?: string;
  planName?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

const safeIdLabel = (rawId: string | undefined, prefix: Parameters<typeof idLabel>[1]): string => {
  if (!rawId || !rawId.trim()) return EMPTY_LABEL;
  return idLabel(rawId, prefix);
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
  const [isManageSubscriptionDrawerOpen, setIsManageSubscriptionDrawerOpen] = useState(false);
  const [drawerPlanId, setDrawerPlanId] = useState("");
  const [drawerPlanLabel, setDrawerPlanLabel] = useState("Current Subscription");
  const [drawerSubscriptionMeta, setDrawerSubscriptionMeta] = useState<DrawerSubscriptionMeta | null>(null);
  const [isPlanChangeDrawerOpen, setIsPlanChangeDrawerOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [isReminderSending, setIsReminderSending] = useState(false);
  const [adjustmentDays, setAdjustmentDays] = useState("7");
  const [feedback, setFeedback] = useState<FeedbackState>(defaultFeedbackState);

  const currentStatus = useMemo(() => {
    if (!tenant) return statusMeta.INACTIVE;
    return statusMeta[tenant.subscription.status] || statusMeta.INACTIVE;
  }, [tenant]);

  const planActionLabel = tenant?.subscription.status === "EXPIRED" ? "Renew Plan" : "Change Plan";
  const masterAdminActionLabel = "Manage Subscription";

  const showFeedback = (message: string, severity: SnackbarSeverity) => {
    setFeedback({ open: true, message, severity });
  };

  const closeFeedback = () => {
    setFeedback((prev) => ({ ...prev, open: false }));
  };

  const refreshTenant = async () => {
    await mutate();
  };

  const openPlanDrawer = (meta: DrawerSubscriptionMeta, label: string) => {
    setDrawerPlanId(meta.planId || "");
    setDrawerSubscriptionMeta(meta);
    setDrawerPlanLabel(label);
    setIsSubscriptionDrawerOpen(true);
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

  const handleSendReminder = async () => {
    if (!tenant || !id) return;

    setIsReminderSending(true);
    try {
      const response = await tenantService.sendSubscriptionReminder(id);
      showFeedback(response.message || "Subscription reminder sent successfully.", "success");
    } catch (actionError) {
      console.error("Failed to send tenant subscription reminder", actionError);
      showFeedback("Failed to send subscription reminder.", "error");
    } finally {
      setIsReminderSending(false);
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
              icon={<Building2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
            />
          </Stack>

          {!isLoading && tenant && isMasterAdmin && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Button
                variant="contained"
                startIcon={<Settings2 size={16} />}
                onClick={() => setIsManageSubscriptionDrawerOpen(true)}
                sx={{ borderRadius: 1, fontWeight: 700, px: 2 }}
              >
                {masterAdminActionLabel}
              </Button>

              <Button
                variant="outlined"
                startIcon={isReminderSending ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
                onClick={handleSendReminder}
                disabled={isReminderSending}
                sx={{ borderRadius: 1, fontWeight: 700, px: 2 }}
              >
                Send Reminder
              </Button>
            </Stack>
          )}

          {!isLoading && tenant && !isMasterAdmin && isAdmin && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Button
                variant="contained"
                startIcon={<ReceiptText size={16} />}
                onClick={() => setIsPlanChangeDrawerOpen(true)}
                sx={{ borderRadius: 1, fontWeight: 700, px: 2 }}
              >
                {planActionLabel}
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>

      {Boolean(error) && (
        <Alert severity="error">Failed to load tenant details. Please refresh and try again.</Alert>
      )}

      {!isLoading && tenant?.upcomingSubscription?.planName && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
          }}
        >
          <Stack spacing={1.5}>
            <Chip
              label="Upcoming Plan Scheduled"
              size="small"
              sx={{ width: "fit-content", fontWeight: 700, bgcolor: "#dbeafe", color: "#1d4ed8" }}
            />
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} alignItems={{ md: "center" }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: LIGHT_SURFACE_TEXT_PRIMARY }}>
                  {tenant.upcomingSubscription.planName}
                </Typography>
                <Typography variant="body2" sx={{ color: LIGHT_SURFACE_TEXT_SECONDARY, mt: 0.4 }}>
                  Activates on {formatDate(tenant.upcomingSubscription.startDate, { isIncludeTime: true })}
                </Typography>
              </Box>

              <Button
                variant="contained"
                endIcon={<ArrowRight size={14} />}
                onClick={() =>
                  openPlanDrawer(
                    {
                      id: tenant.upcomingSubscription?.id,
                      planId: tenant.upcomingSubscription?.planId,
                      planName: tenant.upcomingSubscription?.planName,
                      startDate: tenant.upcomingSubscription?.startDate,
                      endDate: tenant.upcomingSubscription?.endDate,
                      status: tenant.upcomingSubscription?.status,
                    },
                    "Upcoming Subscription"
                  )
                }
                disabled={!tenant.upcomingSubscription?.planId}
                sx={{ borderRadius: 2, fontWeight: 700, px: 2.5, py: 1.1, minWidth: { md: 220 } }}
              >
                View
              </Button>
            </Stack>
          </Stack>
        </Paper>
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
                borderColor: "#334155",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              }}
            >
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
                <Stack direction="row" spacing={1.8} alignItems="center">
                  <Box
                    sx={{
                      width: 66,
                      height: 66,
                      borderRadius: 1,
                      bgcolor: "#1e293b",
                      color: "#22d3ee",
                      border: "1px solid",
                      borderColor: "#475569",
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
                        <Skeleton width={390} height={20} />
                      </>
                    ) : (
                      <>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: HEADER_TEXT_PRIMARY }}>
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
                        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 1.2, md: 1.8 }} sx={{ mt: 0.5 }}>
                          <Typography variant="caption" sx={{ color: HEADER_TEXT_SECONDARY, fontWeight: 500 }}>
                            <Stack component="span" direction="row" spacing={0.5} alignItems="center">
                              <Hash size={12} />
                              <span>ID: {safeIdLabel(tenant?.id, "TENANT")}</span>
                            </Stack>
                          </Typography>
                          <Typography variant="caption" sx={{ color: HEADER_TEXT_SECONDARY, fontWeight: 500 }}>
                            <Stack component="span" direction="row" spacing={0.5} alignItems="center">
                              <Building2 size={12} />
                              <span>Code: {tenant?.companyCode}</span>
                            </Stack>
                          </Typography>
                          <Typography variant="caption" sx={{ color: HEADER_TEXT_SECONDARY, fontWeight: 500 }}>
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
                    <Box>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.04em" }}>
                          OWNER
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mt: 0.45, color: "text.primary", fontWeight: 700 }}>
                          {tenant?.owner?.name || EMPTY_LABEL} ({tenant?.owner?.email || EMPTY_LABEL})
                        </Typography>
                      </Box>
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: { xs: 2, sm: 3 },
                            pr: { md: 2 },
                          }}
                        >
                          <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.04em" }}>
                              CURRENT PLAN
                            </Typography>
                            <Typography variant="subtitle2" sx={{ mt: 0.45, color: "text.primary", fontWeight: 700 }}>
                              {tenant?.subscription.planName || EMPTY_LABEL}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.04em" }}>
                              SUBSCRIPTION ID
                            </Typography>
                            <Typography variant="subtitle2" sx={{ mt: 0.45, color: "text.primary", fontWeight: 700 }}>
                              {safeIdLabel(tenant?.subscription?.id, "SUBSCRIPTION")}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.04em" }}>
                              START DATE
                            </Typography>
                            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.5 }}>
                              <CalendarDays size={16} color="#94a3b8" />
                              <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: 700 }}>
                                {formatDate(tenant?.subscription.startDate || "", { isIncludeTime: true })}
                              </Typography>
                            </Stack>
                          </Box>

                          <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.04em" }}>
                              END DATE
                            </Typography>
                            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.5 }}>
                              <CalendarDays size={16} color="#94a3b8" />
                              <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: 700 }}>
                                {formatDate(tenant?.subscription.endDate || "", { isIncludeTime: true })}
                              </Typography>
                            </Stack>
                          </Box>
                        </Box>

                        <Stack direction="row" spacing={1.2}>
                          <Button
                            variant="text"
                            startIcon={<CreditCard size={14} />}
                            onClick={() =>
                              openPlanDrawer(
                                {
                                  id: tenant?.subscription.id,
                                  planId: tenant?.subscription.planId,
                                  planName: tenant?.subscription.planName,
                                  startDate: tenant?.subscription.startDate,
                                  endDate: tenant?.subscription.endDate,
                                  status: tenant?.subscription.status,
                                },
                                "Current Subscription"
                              )
                            }
                            disabled={!tenant?.subscription.planId}
                            sx={{ px: 0, fontWeight: 700 }}
                          >
                            View subscription
                          </Button>
                        </Stack>

                        {tenant?.upcomingSubscription?.planName && (
                          <Box
                            sx={{
                              p: 2,
                              border: "1px solid",
                              borderColor: "primary.light",
                              borderRadius: 2,
                              bgcolor: "primary.50",
                            }}
                          >
                            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.04em" }}>
                              UPCOMING PLAN
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 0.3, color: "text.primary", fontWeight: 700 }}>
                              {tenant.upcomingSubscription.planName}
                            </Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1.2 }}>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Subscription ID: <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{safeIdLabel(tenant?.upcomingSubscription.id, "SUBSCRIPTION")}</Box>
                              </Typography>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Starts: <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{formatDate(tenant.upcomingSubscription.startDate || "", { isIncludeTime: true })}</Box>
                              </Typography>
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  )}
                </Box>

                <Box
                  sx={{
                    borderLeft: { xs: "none", md: "1px solid" },
                    borderColor: { xs: "transparent", md: "divider" },
                    pl: { xs: 0, md: 4 },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Activity size={16} color="currentColor" />
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
                        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.2 }}>
                          <CalendarDays size={16} color="#0ea5e9" />
                          <Typography variant="subtitle1" sx={{ color: "primary.main", fontWeight: 700 }}>
                            {getDaysRemaining(tenant?.subscription.endDate || "")}
                          </Typography>
                        </Stack>
                      </Box>

                      <Box sx={{ bgcolor: "grey.50", border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.04em" }}>
                          ACTIVE WINDOW
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.4, color: "text.primary", fontWeight: 600 }}>
                          {formatDate(tenant?.subscription.startDate || "")}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                          to
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                          {tenant?.subscription.endDate ? formatDate(tenant.subscription.endDate) : "No expiration date"}
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
        planId={drawerPlanId}
        subscriptionMeta={drawerSubscriptionMeta}
        contextLabel={drawerPlanLabel}
        onClose={() => {
          setIsSubscriptionDrawerOpen(false);
          setDrawerPlanId("");
          setDrawerSubscriptionMeta(null);
          setDrawerPlanLabel("Current Subscription");
        }}
      />

      <TenantPlanChangeDrawer
        open={isPlanChangeDrawerOpen}
        tenant={tenant}
        onClose={() => setIsPlanChangeDrawerOpen(false)}
      />

      <TenantManageSubscriptionDrawer
        open={isManageSubscriptionDrawerOpen}
        tenant={tenant}
        onClose={() => setIsManageSubscriptionDrawerOpen(false)}
        onSaved={refreshTenant}
      />
    </Box>
  );
};

export default TenantDetailsView;
