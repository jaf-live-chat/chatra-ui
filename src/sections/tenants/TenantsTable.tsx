import { useMemo, useState, type MouseEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Eye, MoreVertical, ReceiptText, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

import ReusableTable, {
  type ReusableTableColumn,
} from "../../components/ReusableTable";
import tenantService, { useGetTenants } from "../../services/tenantService";
import type { Tenant, TenantStatus } from "../../models/TenantModel";

const EMPTY_LABEL = "-";

type ActionType = "status" | "delete" | "navigate";

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
  actionType: ActionType;
  tenantId: string;
  nextStatus?: TenantStatus;
}

const defaultDialogState: ConfirmDialogState = {
  open: false,
  title: "",
  description: "",
  actionLabel: "",
  actionType: "navigate",
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

  return {
    label: "INACTIVE",
    sx: {
      bgcolor: "#f59e0b1a",
      color: "#b45309",
      fontWeight: 700,
    },
  };
};

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

const TenantsTable = () => {
  const navigate = useNavigate();
  const { tenants, isLoading, mutate: mutateTenants } = useGetTenants();
  const [processingTenantId, setProcessingTenantId] = useState<string>("");
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(defaultDialogState);
  const [manageDialogOpen, setManageDialogOpen] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const isActionProcessing = (tenantId: string) => processingTenantId === tenantId;

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const refreshTenants = async () => {
    await mutateTenants();
  };

  const handleOpenActionMenu = (event: MouseEvent<HTMLButtonElement>, tenant: Tenant) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedTenant(tenant);
  };

  const handleCloseActionMenu = () => {
    setActionAnchorEl(null);
  };

  const handleViewTenant = () => {
    if (!selectedTenant) return;
    handleCloseActionMenu();
    navigate(`/portal/tenants/${selectedTenant.id}`);
  };

  const handleOpenManageDialog = () => {
    if (!selectedTenant) return;
    handleCloseActionMenu();
    setManageDialogOpen(true);
  };

  const handleCloseManageDialog = () => {
    setManageDialogOpen(false);
  };

  const handleOpenStatusDialog = () => {
    if (!selectedTenant) return;

    const nextStatus: TenantStatus =
      selectedTenant.subscription.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setConfirmDialog({
      open: true,
      title: nextStatus === "ACTIVE" ? "Activate tenant" : "Deactivate tenant",
      description:
        nextStatus === "ACTIVE"
          ? `Activate ${selectedTenant.name} and mark the subscription as active?`
          : `Deactivate ${selectedTenant.name}. The tenant will no longer be active.`,
      actionLabel: nextStatus === "ACTIVE" ? "Activate" : "Deactivate",
      actionType: "status",
      tenantId: selectedTenant.id,
      nextStatus,
    });

    handleCloseActionMenu();
  };

  const handleOpenDeleteDialog = () => {
    if (!selectedTenant) return;

    setConfirmDialog({
      open: true,
      title: "Delete tenant",
      description: `Delete ${selectedTenant.name}? This action cannot be undone.`,
      actionLabel: "Delete",
      actionType: "delete",
      tenantId: selectedTenant.id,
    });

    handleCloseActionMenu();
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog(defaultDialogState);
  };

  const handleConfirmAction = async () => {
    const tenantId = confirmDialog.tenantId;
    if (!tenantId) return;

    setProcessingTenantId(tenantId);
    try {
      if (confirmDialog.actionType === "status" && confirmDialog.nextStatus) {
        await tenantService.updateTenantStatus(tenantId, confirmDialog.nextStatus);
        await refreshTenants();
        showSnackbar("Tenant status updated successfully.", "success");
      }

      if (confirmDialog.actionType === "delete") {
        await tenantService.deleteTenant(tenantId);
        await refreshTenants();
        showSnackbar("Tenant deleted successfully.", "success");
      }
    } catch (error) {
      console.error("Error processing tenant action:", error);
      showSnackbar("Failed to process tenant action.", "error");
    } finally {
      setProcessingTenantId("");
      handleCloseConfirmDialog();
    }
  };

  const goToSubscriptionPlans = () => {
    if (!selectedTenant) return;
    setManageDialogOpen(false);
    navigate(`/portal/subscription-plans?tenantId=${selectedTenant.id}`);
  };

  const tenantColumns = useMemo<ReusableTableColumn<Tenant>[]>(
    () => [
      {
        id: "name",
        label: "Tenant Name",
        width: "24%",
        renderCell: (tenant) => tenant.name || EMPTY_LABEL,
      },
      {
        id: "plan",
        label: "Plan",
        width: "20%",
        renderCell: (tenant) => tenant.subscription.planName || EMPTY_LABEL,
      },
      {
        id: "startDate",
        label: "Start Date",
        width: "16%",
        renderCell: (tenant) => formatDate(tenant.subscription.startDate),
      },
      {
        id: "endDate",
        label: "End Date",
        width: "16%",
        renderCell: (tenant) => formatDate(tenant.subscription.endDate),
      },
      {
        id: "status",
        label: "Status",
        width: "12%",
        renderCell: (tenant) => {
          const statusDisplay = getStatusChipStyles(tenant.subscription.status);
          return <Chip label={statusDisplay.label} size="small" sx={statusDisplay.sx} />;
        },
      },
      {
        id: "actions",
        label: "Actions",
        width: "12%",
        align: "right",
        headerAlign: "right",
        renderCell: (tenant) => (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Tooltip title="Tenant actions">
              <span>
                <IconButton
                  size="small"
                  onClick={(event) => handleOpenActionMenu(event, tenant)}
                  disabled={isActionProcessing(tenant.id)}
                >
                  <MoreVertical size={16} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [processingTenantId],
  );

  return (
    <div className="space-y-5">
      <div>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "grey.900" }}>
          Tenants Management
        </Typography>
        <Typography variant="body2" sx={{ color: "grey.600", mt: 0.5 }}>
          View tenant subscriptions and status overview.
        </Typography>
      </div>

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
        searchPlaceholder="Search tenants, plans, or status"
        searchBy={(tenant) =>
          `${tenant.name} ${tenant.subscription.planName} ${tenant.subscription.status}`
        }
        rowsPerPage={5}
        totalLabel="tenants"
      />

      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem onClick={handleViewTenant}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Eye size={16} />
            <ListItemText primary="View Tenant" />
          </Stack>
        </MenuItem>
        <MenuItem onClick={handleOpenManageDialog}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <ReceiptText size={16} />
            <ListItemText primary="Manage Subscription" />
          </Stack>
        </MenuItem>
        <MenuItem onClick={handleOpenStatusDialog}>
          <ListItemText
            primary={
              selectedTenant?.subscription.status === "ACTIVE"
                ? "Deactivate Tenant"
                : "Activate Tenant"
            }
          />
        </MenuItem>
        <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: "error.main" }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Trash2 size={16} />
            <ListItemText primary="Delete Tenant" />
          </Stack>
        </MenuItem>
      </Menu>

      <Dialog
        open={manageDialogOpen}
        onClose={handleCloseManageDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Manage Subscription</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedTenant?.name || EMPTY_LABEL}
            </Typography>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Current Plan
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedTenant?.subscription.planName || EMPTY_LABEL}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Subscription Window
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatDate(selectedTenant?.subscription.startDate || "")} - {" "}
                {formatDate(selectedTenant?.subscription.endDate || "")}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseManageDialog}>Close</Button>
          <Button variant="contained" onClick={goToSubscriptionPlans}>
            Go To Subscription Plans
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {confirmDialog.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseConfirmDialog}
            disabled={isActionProcessing(confirmDialog.tenantId)}
          >
            Cancel
          </Button>
          <Button
            color={confirmDialog.actionType === "delete" ? "error" : "primary"}
            variant="contained"
            onClick={handleConfirmAction}
            disabled={isActionProcessing(confirmDialog.tenantId)}
          >
            {isActionProcessing(confirmDialog.tenantId) ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              confirmDialog.actionLabel
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2800}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TenantsTable;
