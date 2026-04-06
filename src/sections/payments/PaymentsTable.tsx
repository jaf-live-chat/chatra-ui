import { useMemo, useState, type CSSProperties } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Eye } from "lucide-react";

import ReusableTable, { type ReusableTableColumn } from "../../components/ReusableTable";
import type { Payment, PaymentStatus } from "../../models/PaymentModel";
import { formatDate } from "../../utils/dateFormatter";
import { useGetPayments } from "../../services/paymentServices";
import formatAmount from "../../utils/amountFormatter";
import Avatar from "@mui/material/Avatar";
import getAvatarColor from "../../utils/getAvatarColor";
import idLabel from "../../utils/idUtils";

const statusStyles: Record<PaymentStatus, { label: string; bg: string; color: string }> = {
  COMPLETED: {
    label: "Completed",
    bg: "#16a34a1a",
    color: "#15803d",
  },
  PENDING: {
    label: "Pending",
    bg: "#f59e0b1a",
    color: "#b45309",
  },
  FAILED: {
    label: "Failed",
    bg: "#dc26261a",
    color: "#b91c1c",
  },
};

const statusPriority: Record<PaymentStatus, number> = {
  COMPLETED: 1,
  PENDING: 2,
  FAILED: 3,
};

const formatTransactionDate = (dateString: string) => {
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return formatDate(parsedDate.toISOString(), { format: "long", isIncludeTime: false });
};

const PaymentsTable = () => {
  const { payments, isLoading, error } = useGetPayments();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  const openDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedPayment(null);
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
    color: "grey.700",
    fontWeight: 600,
    height: 32,
    minWidth: 72,
    backgroundColor: "background.paper",
    "&:hover": { bgcolor: "grey.50", borderColor: "grey.400" },
  };

  const paymentColumns = useMemo<ReusableTableColumn<Payment>[]>(
    () => [
      {
        id: "tenant",
        label: "Tenant",
        sortable: true,
        sortAccessor: (payment) => payment.tenantName,
        renderCell: (payment) => (
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
              {payment.tenantName.slice(0, 2).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900", lineHeight: 1.2 }}>
                {payment.tenantName}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                {idLabel(payment.id, "PAYMENT")}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        id: "amount",
        label: "Amount",
        sortable: true,
        sortAccessor: (payment) => payment.amount,
        renderCell: (payment) => formatAmount(payment.amount),
      },
      {
        id: "transactionDate",
        label: "Transaction Date",
        sortable: true,
        sortAccessor: (payment) => new Date(payment.transactionDate),
        renderCell: (payment) => formatTransactionDate(payment.transactionDate),
      },
      {
        id: "status",
        label: "Payment Status",
        sortable: true,
        sortAccessor: (payment) => statusPriority[payment.status],
        renderCell: (payment) => {
          const style = statusStyles[payment.status];
          return (
            <Chip
              label={style.label}
              size="small"
              sx={{ bgcolor: style.bg, color: style.color, fontWeight: 700 }}
            />
          );
        },
      },
      {
        id: "actions",
        label: <span style={visuallyHidden}>Actions</span>,
        align: "right",
        headerAlign: "right",
        renderCell: (payment) => (
          <Tooltip title="View payment details">
            <Button
              size="small"
              variant="outlined"
              onClick={() => openDetails(payment)}
              sx={actionButtonSx}
              startIcon={<Eye size={16} />}
            >
              View
            </Button>
          </Tooltip>
        ),
      },
    ],
    [],
  );

  return (
    <Stack spacing={3} sx={{ width: "100%" }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "grey.900" }}>
          Payments
        </Typography>
        <Typography variant="body2" sx={{ color: "grey.600", mt: 0.5 }}>
          Tenant payments overview with status, transaction date, and subscription type.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" variant="outlined">
          Failed to load payments. Please try again.
        </Alert>
      )}

      <ReusableTable
        title="Payments"
        subtitle="Recent payment activity across tenants."
        rows={payments}
        columns={paymentColumns}
        getRowKey={(payment) => payment.id}
        pagination={{ rowsPerPage: 10 }}
        search={{
          placeholder: "Search by tenant, status, or subscription",
          by: (payment) =>
            `${payment.tenantName} ${statusStyles[payment.status].label} ${payment.amount}`,
        }}
        loading={isLoading}
        loadingLabel="Loading payments..."
        emptyStateTitle="No payments found"
        emptyStateDescription="No payment records are available yet."
        totalLabel="payments"
      />

      <Dialog open={detailsOpen} onClose={closeDetails} fullWidth maxWidth="sm">
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 0.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Tenant
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedPayment?.tenantName || "-"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Subscription
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedPayment?.amount || "-"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Box>
                {selectedPayment ? (
                  <Chip
                    label={statusStyles[selectedPayment.status].label}
                    size="small"
                    sx={{
                      bgcolor: statusStyles[selectedPayment.status].bg,
                      color: statusStyles[selectedPayment.status].color,
                      fontWeight: 700,
                      mt: 0.5,
                    }}
                  />
                ) : (
                  <Typography variant="body2">-</Typography>
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Transaction Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedPayment ? formatTransactionDate(selectedPayment.transactionDate) : "-"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Reference Number
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedPayment?.referenceNumber || "-"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Amount
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatAmount(selectedPayment?.amount)}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default PaymentsTable;