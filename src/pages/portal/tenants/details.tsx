import { ArrowLeft, Building2, CalendarClock, Circle, CreditCard, ReceiptText } from "lucide-react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useGetSingleTenant } from "../../../services/tenantService";
import type { TenantStatus } from "../../../models/TenantModel";

const EMPTY_LABEL = "-";

const formatDate = (rawDate: string) => {
  if (!rawDate) return EMPTY_LABEL;

  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) return EMPTY_LABEL;

  return new Intl.DateTimeFormat("en-SG", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(parsedDate);
};

const statusMeta: Record<TenantStatus, { label: string; bg: string; color: string }> = {
  ACTIVE: { label: "Active", bg: "#dcfce7", color: "#15803d" },
  INACTIVE: { label: "Inactive", bg: "#fef3c7", color: "#b45309" },
  EXPIRED: { label: "Expired", bg: "#fee2e2", color: "#b91c1c" },
};

const TenantDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tenant, isLoading, error } = useGetSingleTenant(id);

  const currentStatus = useMemo(() => {
    if (!tenant) return statusMeta.INACTIVE;
    return statusMeta[tenant.subscription.status] || statusMeta.INACTIVE;
  }, [tenant]);

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
            Subscription overview and tenant identity details.
          </Typography>
        </Stack>

        {!isLoading && tenant && (
          <Button
            variant="contained"
            startIcon={<ReceiptText size={16} />}
            onClick={() => navigate(`/portal/subscription-plans?tenantId=${tenant.id}`)}
            sx={{ borderRadius: 1, fontWeight: 700 }}
          >
            Manage Subscription
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
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        ID: {tenant?.id}
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
                        {formatDate(tenant?.subscription.startDate || "")}
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
                        {formatDate(tenant?.subscription.endDate || "")}
                      </Typography>
                    )}
                  </Box>
                </Stack>
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
                      {formatDate(tenant?.subscription.startDate || "")} to {formatDate(tenant?.subscription.endDate || "")}
                    </Typography>
                  </Typography>
                </Stack>
              )}
            </Paper>
          </Stack>
        </>
      )}
    </Box>
  );
};

export default TenantDetails;