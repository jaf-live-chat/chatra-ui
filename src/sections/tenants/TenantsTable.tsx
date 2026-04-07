import { useState, type CSSProperties } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
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

const EMPTY_LABEL = "-";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

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
      sx: {
        bgcolor: "#16a34a1a",
        color: "#15803d",
        fontWeight: 700,
      },
    };
  }

  if (status === "EXPIRED") {
    return {
      label: "EXPIRED",
      sx: {
        bgcolor: "#dc26261a",
        color: "#b91c1c",
        fontWeight: 700,
      },
    };
  }

  if (status === "DEACTIVATED") {
    return {
      label: "DEACTIVATED",
      sx: {
        bgcolor: "#ea580c1a",
        color: "#c2410c",
        fontWeight: 700,
      },
    };
  }

  return {
    label: "INACTIVE",
    sx: {
      bgcolor: "#f59e0b1a",
      color: "#b45309",
      fontWeight: 700,
    },
  };
};

const TenantsTable = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 5;

  const { tenants, isLoading, mutate: mutateTenants, pagination } = useGetTenants(currentPage, ROWS_PER_PAGE);
  const [processingTenantId, setProcessingTenantId] = useState<string>("");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(defaultDialogState);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: "", severity: "success" });

  const isActionProcessing = (tenantId: string) => processingTenantId === tenantId;

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

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
      showSnackbar("Tenant status updated successfully.", "success");
    } catch (error) {
      console.error("Error processing tenant action:", error);
      showSnackbar("Failed to process tenant action.", "error");
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
    px: 1.6,
    borderColor: "grey.300",
    color: "grey.800",
    fontWeight: 700,
    height: 34,
    minWidth: 76,
    backgroundColor: "#f8fafc",
    "&:hover": { bgcolor: "#e2e8f0", borderColor: "grey.400" },
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
      renderCell: (tenant) => tenant.subscription.planName || EMPTY_LABEL,
    },
    {
      id: "startDate",
      label: "Start Date",
      sortable: true,
      sortAccessor: (tenant) => new Date(tenant.subscription.startDate),
      renderCell: (tenant) => formatDate(tenant.subscription.startDate),
    },
    {
      id: "endDate",
      label: "End Date",
      sortable: true,
      align: "center",
      sortAccessor: (tenant) => new Date(tenant.subscription.endDate),
      renderCell: (tenant) => {
        if (tenant.subscription.planName === 'Free Internal Plan') {
          return (
            <Tooltip title="This is the owner tenant which has a free internal plan with no expiration date.">
              <span style={{ cursor: "help" }}>
                <Chip label="No Expiration" size="small" color="info" variant="filled" />
              </span>
            </Tooltip>
          )
        } else {
          return formatDate(tenant.subscription.endDate);
        }
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
                  color: tenant.subscription.status === "ACTIVE" ? "#b91c1c" : "#166534",
                  borderColor: tenant.subscription.status === "ACTIVE" ? "#fecdd3" : "#bbf7d0",
                  backgroundColor: tenant.subscription.status === "ACTIVE" ? "#fff1f2" : "#f0fdf4",
                  "&:hover": {
                    bgcolor: tenant.subscription.status === "ACTIVE" ? "#ffe4e6" : "#dcfce7",
                    borderColor: tenant.subscription.status === "ACTIVE" ? "#fca5a5" : "#86efac",
                  },
                }}
                disabled={isActionProcessing(tenant.id)}
                startIcon={<Power size={16} />}
              >
                {tenant.subscription.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </Button>
            </span>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <TitleTag
        title="Tenants Management"
        subtitle="View tenant subscriptions and status overview."
        icon={<Building2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
      />

      <ReusableTable
        title="Tenants"
        subtitle="View tenant subscriptions and status overview."
        rows={tenants}
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
          totalRows: pagination?.totalRecords,
        }}
        tableMinWidth={1150}
        totalLabel="tenants"
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TenantsTable;