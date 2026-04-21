import { useState, type CSSProperties } from "react";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Building2, Eye, Power } from "lucide-react";
import { useNavigate } from "react-router";

import ReusableTable, { type ReusableTableColumn } from "../../components/ReusableTable";
import type { Tenant, TenantStatus } from "../../models/TenantModel";
import tenantService, { useGetTenants } from "../../services/tenantService";
import { formatDate } from "../../utils/dateFormatter";
import Avatar from "@mui/material/Avatar";
import idLabel from "../../utils/idUtils";
import Box from "@mui/material/Box";
import getAvatarColor from "../../utils/getAvatarColor";
import TitleTag from "../../components/TitleTag";
import type { Theme } from "@mui/material/styles";
import { toast } from "../../components/sonner";
import useAuth from "../../hooks/useAuth";
import useGetRole from "../../hooks/useGetRole";

const EMPTY_LABEL = "-";
const INTERNAL_OWNER_PLAN_NAME = "Free Internal Plan";

interface ConfirmDialogState {
  open: boolean;
  title: string;
  description: string;
  actionLabel: string;
  tenantId: string;
  nextStatus?: TenantStatus;
}

const defaultDialogState: ConfirmDialogState = {
  open: false,
  title: "",
  description: "",
  actionLabel: "",
  tenantId: "",
};

const getStatusChipStyles = (status: TenantStatus) => {
  if (status === "ACTIVE") {
    return {
      label: "ACTIVE",
      sx: (theme: Theme) => ({
        bgcolor: theme.palette.mode === "dark" ? "#166534" : "#16a34a1a",
        color: theme.palette.mode === "dark" ? "#ffffff" : "#15803d",
        fontWeight: 700,
      }),
    };
  }

  if (status === "EXPIRED") {
    return {
      label: "EXPIRED",
      sx: (theme: Theme) => ({
        bgcolor: theme.palette.mode === "dark" ? "#991b1b" : "#dc26261a",
        color: theme.palette.mode === "dark" ? "#ffffff" : "#b91c1c",
        fontWeight: 700,
      }),
    };
  }

  if (status === "DEACTIVATED") {
    return {
      label: "DEACTIVATED",
      sx: (theme: Theme) => ({
        bgcolor: theme.palette.mode === "dark" ? "#9a3412" : "#ea580c1a",
        color: theme.palette.mode === "dark" ? "#ffffff" : "#c2410c",
        fontWeight: 700,
      }),
    };
  }

  return {
    label: "INACTIVE",
    sx: (theme: Theme) => ({
      bgcolor: theme.palette.mode === "dark" ? "#92400e" : "#f59e0b1a",
      color: theme.palette.mode === "dark" ? "#ffffff" : "#b45309",
      fontWeight: 700,
    }),
  };
};

const TenantsTable = () => {
  const navigate = useNavigate();
  const { tenant: loggedInTenant } = useAuth();
  const { isMasterAdmin } = useGetRole();
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 5;

  const { tenants, isLoading, mutate: mutateTenants, pagination } = useGetTenants(currentPage, ROWS_PER_PAGE);
  const [processingTenantId, setProcessingTenantId] = useState<string>("");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(defaultDialogState);

  const ownerTenantId = loggedInTenant?.id || "";
  const visibleTenants = tenants.filter((tenant) => {
    if (!isMasterAdmin) return true;

    // Hide owner tenant entry from tenants management for master admin.
    if (ownerTenantId && tenant.id === ownerTenantId) {
      return false;
    }

    return tenant.subscription.planName !== INTERNAL_OWNER_PLAN_NAME;
  });

  const isActionProcessing = (tenantId: string) => processingTenantId === tenantId;

  const totalTenantCount = isMasterAdmin
    ? visibleTenants.length
    : (pagination?.totalRecords ?? visibleTenants.length);

  const refreshTenants = async () => {
    await mutateTenants();
  };
  const handleViewTenant = (tenant: Tenant) => {
    navigate(`/portal/tenants/${tenant.id}`);
  };

  const handleOpenStatusDialog = (tenant: Tenant) => {
    const nextStatus: TenantStatus = tenant.subscription.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setConfirmDialog({
      open: true,
      title: nextStatus === "ACTIVE" ? "Activate tenant" : "Deactivate tenant",
      description:
        nextStatus === "ACTIVE"
          ? `Activate ${tenant.name} and mark the subscription as active?`
          : `Deactivate ${tenant.name}. The tenant will no longer be active.`,
      actionLabel: nextStatus === "ACTIVE" ? "Activate" : "Deactivate",
      tenantId: tenant.id,
      nextStatus,
    });
  };

  const handleCloseConfirmDialog = () => setConfirmDialog(defaultDialogState);

  const handleConfirmAction = async () => {
    const tenantId = confirmDialog.tenantId;
    if (!tenantId || !confirmDialog.nextStatus) return;

    setProcessingTenantId(tenantId);
    try {
      await tenantService.updateTenantStatus(tenantId, confirmDialog.nextStatus);
      await refreshTenants();
      toast.success("Tenant status updated successfully.");
    } catch (error) {
      console.error("Error processing tenant action:", error);
      toast.error("Failed to process tenant action.");
    } finally {
      setProcessingTenantId("");
      handleCloseConfirmDialog();
    }
  };

  const visuallyHidden: CSSProperties = {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    width: 1,
  };

  const actionButtonSx = {
    textTransform: "none" as const,
    borderRadius: 9999,
    px: { xs: 1.2, sm: 1.6 },
    borderColor: "divider",
    color: "text.primary",
    fontWeight: 700,
    height: 34,
    minWidth: { xs: 0, sm: 76 },
    backgroundColor: "background.paper",
    "&:hover": { bgcolor: "action.hover", borderColor: "divider" },
  };

  const tenantColumns: ReusableTableColumn<Tenant>[] = [
    {
      id: "name",
      label: "Tenant Name",
      sortable: true,
      sortAccessor: (tenant) => tenant.name,
      renderCell: (tenant) => (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: getAvatarColor(),
              fontSize: "0.875rem",
              fontWeight: 700,
            }}
          >
            {tenant.name.slice(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900", lineHeight: 1.2 }}>
              {tenant.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
              {idLabel(tenant.id, "TENANT")}
            </Typography>
          </Box>
        </Stack>
      )
    },
    {
      id: "plan",
      label: "Plan",
      sortable: true,
      sortAccessor: (tenant) => tenant.subscription.planName,
      renderCell: (tenant) =>
        tenant.subscription.planName === INTERNAL_OWNER_PLAN_NAME
          ? EMPTY_LABEL
          : (tenant.subscription.planName || EMPTY_LABEL),
    },
    {
      id: "startDate",
      label: "Start Date",
      sortable: true,
      sortAccessor: (tenant) => new Date(tenant.subscription.startDate),
      renderCell: (tenant) =>
        tenant.subscription.planName === INTERNAL_OWNER_PLAN_NAME
          ? EMPTY_LABEL
          : formatDate(tenant.subscription.startDate),
    },
    {
      id: "endDate",
      label: "End Date",
      sortable: true,
      align: "center",
      sortAccessor: (tenant) => new Date(tenant.subscription.endDate),
      renderCell: (tenant) => {
        if (tenant.subscription.planName === INTERNAL_OWNER_PLAN_NAME) {
          return EMPTY_LABEL;
        }

        return formatDate(tenant.subscription.endDate);
      },
    },
    {
      id: "status",
      label: "Status",
      align: "right",
      sortable: true,
      sortAccessor: (tenant) => tenant.subscription.status,
      renderCell: (tenant) => {
        const statusDisplay = getStatusChipStyles(tenant.subscription.status);
        return <Chip label={statusDisplay.label} size="small" sx={statusDisplay.sx} />;
      },
    },
    {
      id: "actions",
      label: <span style={visuallyHidden}>Actions</span>,
      align: "right",
      headerAlign: "right",
      renderCell: (tenant) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" rowGap={0.5}>
          <Tooltip title="View tenant details">
            <span>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleViewTenant(tenant)}
                sx={actionButtonSx}
                disabled={isActionProcessing(tenant.id)}
                startIcon={<Eye size={16} />}
              >
                View
              </Button>
            </span>
          </Tooltip>
          {tenant.subscription.status === "ACTIVE" && (
            <Tooltip
              title={tenant.subscription.status === "ACTIVE" ? "Deactivate tenant" : "Activate tenant"}
            >
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleOpenStatusDialog(tenant)}
                  sx={{
                    ...actionButtonSx,
                    color: tenant.subscription.status === "ACTIVE" ? "error.light" : "success.light",
                    borderColor: tenant.subscription.status === "ACTIVE" ? "error.dark" : "success.dark",
                    backgroundColor: tenant.subscription.status === "ACTIVE" ? "#7f1d1d1f" : "#14532d1f",
                    "&:hover": {
                      bgcolor: tenant.subscription.status === "ACTIVE" ? "#7f1d1d2f" : "#14532d2f",
                      borderColor: tenant.subscription.status === "ACTIVE" ? "error.main" : "success.main",
                    },
                  }}
                  disabled={isActionProcessing(tenant.id)}
                  startIcon={<Power size={16} />}
                >
                  Deactivate
                </Button>
              </span>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <div className="space-y-4">
    

      <ReusableTable
        title="Tenants"
        subtitle="View tenant subscriptions and status overview."
        compact
        headerBadges={(
          <Chip
            label={`${totalTenantCount} tenants`}
            size="small"
            sx={{
              bgcolor: "#e0f2fe",
              color: "#0e7490",
              fontWeight: 700,
              height: 28,
              borderRadius: 1,
            }}
          />
        )}
        rows={visibleTenants}
        columns={tenantColumns}
        getRowKey={(tenant) => tenant.id}
        loading={isLoading}
        loadingLabel="Loading tenants..."
        emptyStateTitle="No tenants found"
        emptyStateDescription="Try adjusting your search or add a new tenant."
        search={{
          placeholder: "Search tenants, plans, or status",
          by: (tenant) => `${tenant.name} ${tenant.subscription.planName} ${tenant.subscription.status}`,
        }}
        pagination={{
          rowsPerPage: ROWS_PER_PAGE,
          page: currentPage,
          onPageChange: setCurrentPage,
          totalRows: totalTenantCount,
        }}
        tableMinWidth={980}
        totalLabel="tenants"
        showTotalBadge={false}
      />

      <Dialog open={confirmDialog.open} onClose={handleCloseConfirmDialog} fullWidth maxWidth="xs">
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {confirmDialog.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} disabled={isActionProcessing(confirmDialog.tenantId)}>
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleConfirmAction}
            disabled={isActionProcessing(confirmDialog.tenantId)}
          >
            {isActionProcessing(confirmDialog.tenantId) ? <CircularProgress size={16} color="inherit" /> : confirmDialog.actionLabel}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default TenantsTable;