import { useMemo, useState, type CSSProperties } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { DollarSign, Eye, FileText } from "lucide-react";

import ReusableTable, { type ReusableTableColumn } from "../../components/ReusableTable";
import type { Payment, PaymentStatus } from "../../models/PaymentModel";
import { formatDate } from "../../utils/dateFormatter";
import { useGetPayments } from "../../services/paymentServices";
import formatAmount from "../../utils/amountFormatter";
import Avatar from "@mui/material/Avatar";
import getAvatarColor from "../../utils/getAvatarColor";
import idLabel from "../../utils/idUtils";
import TitleTag from "../../components/TitleTag";

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
  CANCELLED: {
    label: "Cancelled",
    bg: "#f973161a",
    color: "#c2410c",
  },
};

const statusPriority: Record<PaymentStatus, number> = {
  COMPLETED: 1,
  PENDING: 2,
  FAILED: 3,
  CANCELLED: 4,
};

const formatTransactionDate = (dateString: string) => {
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return formatDate(parsedDate.toISOString(), { format: "long", isIncludeTime: false });
};

const formatBillingPeriod = (dateString?: string) => {
  if (!dateString) return "-";

  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
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
    px: { xs: 1.2, sm: 1.6 },
    borderColor: "divider",
    color: "text.primary",
    fontWeight: 600,
    height: 32,
    minWidth: { xs: 0, sm: 72 },
    backgroundColor: "background.paper",
    "&:hover": { bgcolor: "action.hover", borderColor: "divider" },
  };

  const selectedStatusStyle = selectedPayment ? statusStyles[selectedPayment.status] : null;

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
              <Box component="p" sx={{ m: 0, fontSize: "0.875rem", fontWeight: 600, color: "text.primary", lineHeight: 1.2 }}>
                {payment.tenantName}
              </Box>
              <Box component="p" sx={{ m: 0, color: "text.secondary", fontSize: "0.7rem" }}>
                {idLabel(payment.id, "PAYMENT")}
              </Box>
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
      <TitleTag
        title="Payments"
        subtitle="Tenant payments overview with status, transaction date, and subscription type."
        icon={<DollarSign className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
      />

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

      <Drawer
        anchor="right"
        open={detailsOpen}
        onClose={closeDetails}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 460 },
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box sx={{ p: 3, pb: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.2 }}>
            <FileText size={18} color="#0284c7" />
            <Box component="h2" sx={{ m: 0, fontWeight: 800, color: "text.primary", fontSize: "1.05rem", lineHeight: 1.2 }}>
              Transaction Details
            </Box>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Stack direction="row" alignItems="center" spacing={1.4} sx={{ mb: 2.6 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "#0ea5e9",
                fontWeight: 800,
                fontSize: "1.85rem",
                letterSpacing: "-0.02em",
              }}
            >
              {(selectedPayment?.tenantName || "-").slice(0, 2).toUpperCase()}
            </Avatar>
            <Box>
              <Box component="p" sx={{ m: 0, fontSize: "0.95rem", fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                {selectedPayment?.tenantName || "-"}
              </Box>
              <Box component="p" sx={{ m: 0, fontSize: "0.75rem", color: "text.secondary", fontWeight: 500 }}>
                ID: {selectedPayment ? idLabel(selectedPayment.id, "PAYMENT") : "-"}
              </Box>
            </Box>
          </Stack>

          <Box
            sx={{
              borderRadius: 2,
              backgroundColor: "background.default",
              border: "1px solid",
              borderColor: "divider",
              p: 2.4,
              mb: 3,
            }}
          >
            <Box component="p" sx={{ m: 0, fontSize: "0.78rem", color: "text.secondary", fontWeight: 700, mb: 0.9 }}>
              Total Amount
            </Box>
            <Box component="p" sx={{ m: 0, color: "text.primary", fontSize: "1.55rem", fontWeight: 900, lineHeight: 1.05 }}>
              {formatAmount(selectedPayment?.amount)}
            </Box>

            {selectedStatusStyle && (
              <Chip
                label={`• ${selectedStatusStyle.label}`}
                size="small"
                sx={{
                  mt: 1.5,
                  bgcolor: selectedStatusStyle.bg,
                  color: selectedStatusStyle.color,
                  fontWeight: 700,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "8px",
                }}
              />
            )}
          </Box>

          <Box component="p" sx={{ m: 0, color: "text.secondary", fontSize: "0.78rem", fontWeight: 800, mb: 1.1, letterSpacing: "0.02em" }}>
            PAYMENT INFORMATION
          </Box>

          <Stack spacing={0} sx={{ mb: 2.4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.15 }}>
              <Box component="p" sx={{ m: 0, fontSize: "0.85rem", color: "text.secondary" }}>
                Date
              </Box>
              <Box component="p" sx={{ m: 0, fontSize: "0.85rem", color: "text.primary", fontWeight: 700 }}>
                {selectedPayment ? formatTransactionDate(selectedPayment.transactionDate) : "-"}
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.15 }}>
              <Box component="p" sx={{ m: 0, fontSize: "0.85rem", color: "text.secondary" }}>
                Reference Number
              </Box>
              <Box
                component="p"
                sx={{
                  m: 0,
                  fontSize: "0.85rem",
                  color: "text.primary",
                  fontWeight: 700,
                  textAlign: "right",
                  maxWidth: "72%",
                  overflowWrap: "anywhere",
                }}
              >
                {selectedPayment?.referenceNumber || "-"}
              </Box>
            </Stack>
          </Stack>

          <Box component="p" sx={{ m: 0, color: "text.secondary", fontSize: "0.78rem", fontWeight: 800, mb: 1.1, letterSpacing: "0.02em" }}>
            SUBSCRIPTION DETAILS
          </Box>

          <Stack spacing={0}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.15 }}>
              <Box component="p" sx={{ m: 0, fontSize: "0.85rem", color: "text.secondary" }}>
                Plan
              </Box>
              <Box component="p" sx={{ m: 0, fontSize: "0.85rem", color: "text.primary", fontWeight: 700 }}>
                {selectedPayment?.subscriptionType || "-"}
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.15 }}>
              <Box component="p" sx={{ m: 0, fontSize: "0.85rem", color: "text.secondary" }}>
                Billing Period
              </Box>
              <Box component="p" sx={{ m: 0, fontSize: "0.85rem", color: "text.primary", fontWeight: 700 }}>
                {formatBillingPeriod(selectedPayment?.transactionDate)}
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Box
          sx={{
            mt: "auto",
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.default",
          }}
        >
          <Button
            onClick={closeDetails}
            fullWidth
            variant="outlined"
            sx={{
              height: 48,
              borderRadius: 2,
              borderColor: "divider",
              color: "text.primary",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { borderColor: "divider", backgroundColor: "action.hover" },
            }}
          >
            Close Details
          </Button>
        </Box>
      </Drawer>
    </Stack>
  );
};

export default PaymentsTable;