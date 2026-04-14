import { useMemo, useState } from "react";
import { ArrowLeft, MessageSquare, UserRound } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ReusableTable, { type ReusableTableColumn } from "../../components/ReusableTable";
import TitleTag from "../../components/TitleTag";
import { useGetConversationMessages } from "../../hooks/useLiveChat";
import { useGetVisitorDetails } from "../../hooks/useVisitors";
import type { LiveChatMessage } from "../../models/LiveChatModel";
import type {
  ConversationMessagesDialogState,
  VisitorConversationHistory,
} from "../../models/VisitorModel";
import idLabel from "../../utils/idUtils";

const ROWS_PER_PAGE = 8;

const getInitials = (name: string) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "VS";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
};

const toDateLabel = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const resolveVisitorName = (name?: string | null, emailAddress?: string | null) => {
  const normalizedName = String(name || "").trim();
  if (normalizedName) {
    return normalizedName;
  }

  const normalizedEmail = String(emailAddress || "").trim();
  if (normalizedEmail) {
    return normalizedEmail;
  }

  return "Website Visitor";
};

const resolveAgentName = (conversation: VisitorConversationHistory) => {
  const { agentId } = conversation;

  if (!agentId) {
    return "Unassigned";
  }

  if (typeof agentId === "string") {
    return agentId;
  }

  return String(agentId.fullName || agentId.displayName || agentId._id || "Unassigned");
};

const resolveStatusColor = (status?: string) => {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "WAITING") {
    return "warning" as const;
  }

  if (normalizedStatus === "OPEN") {
    return "info" as const;
  }

  if (normalizedStatus === "ENDED") {
    return "success" as const;
  }

  return "default" as const;
};

const getMessageSenderLabel = (message: LiveChatMessage) => {
  if (message.senderType === "VISITOR") {
    return "Visitor";
  }

  return "Agent";
};

const VisitorDetailsSection = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [messageDialog, setMessageDialog] = useState<ConversationMessagesDialogState | null>(null);

  const { visitor, conversations, pagination, isLoading, error } = useGetVisitorDetails(id, {
    page,
    limit: ROWS_PER_PAGE,
  });

  const {
    messages,
    isLoading: isMessagesLoading,
    error: messagesError,
  } = useGetConversationMessages(messageDialog?.conversationId, {
    page: 1,
    limit: 100,
  });

  const visitorName = useMemo(() => {
    return resolveVisitorName(visitor?.displayName || visitor?.name, visitor?.emailAddress);
  }, [visitor?.displayName, visitor?.emailAddress, visitor?.name]);

  const locationLabel = useMemo(() => {
    const city = String(visitor?.locationCity || "").trim();
    const country = String(visitor?.locationCountry || "").trim();

    if (city && country) {
      return `${city}, ${country}`;
    }

    if (city) {
      return city;
    }

    if (country) {
      return country;
    }

    return "Unknown";
  }, [visitor?.locationCity, visitor?.locationCountry]);

  const columns: ReusableTableColumn<VisitorConversationHistory>[] = [
    {
      id: "conversation",
      label: "Conversation",
      renderCell: (conversation) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
            {`CHAT_${String(conversation._id || "").slice(-7).toUpperCase()}`}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {toDateLabel(conversation.createdAt)}
          </Typography>
        </Box>
      ),
    },
    {
      id: "status",
      label: "Status",
      renderCell: (conversation) => (
        <Chip
          label={String(conversation.status || "UNKNOWN")}
          size="small"
          color={resolveStatusColor(conversation.status)}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      id: "agent",
      label: "Agent",
      renderCell: (conversation) => (
        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
          {resolveAgentName(conversation)}
        </Typography>
      ),
    },
    {
      id: "history",
      label: "History",
      renderCell: (conversation) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
            {conversation.history?.messageCount || 0} messages
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "inline-block",
              maxWidth: 240,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {conversation.history?.lastMessage || "No messages"}
          </Typography>
        </Box>
      ),
    },
    {
      id: "action",
      label: "",
      align: "right",
      headerAlign: "right",
      renderCell: (conversation) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setMessageDialog({
              conversationId: String(conversation._id || ""),
              title: `CHAT_${String(conversation._id || "").slice(-7).toUpperCase()}`,
            });
          }}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          View Chat
        </Button>
      ),
    },
  ];

  if (!id) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Alert severity="error">Missing visitor id in route.</Alert>
      </Paper>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <TitleTag
          title="Visitor Details"
          subtitle="Identity details and complete conversation history for this visitor."
          icon={<UserRound className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
        />

        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate("/portal/visitors")}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Back to Visitors
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error">Failed to load visitor details. Please refresh and try again.</Alert>
      ) : null}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: { xs: 2, md: 2.5 },
        }}
      >
        {isLoading && !visitor ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={18} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Loading visitor profile...
            </Typography>
          </Stack>
        ) : (
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }}>
            <Avatar
              sx={(theme) => ({
                width: 48,
                height: 48,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontWeight: 700,
              })}
            >
              {getInitials(visitorName)}
            </Avatar>

            <Stack spacing={0.5} sx={{ minWidth: 220 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
                {visitorName}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {idLabel(String(visitor?._id || ""), "VISITOR")}
              </Typography>
            </Stack>

            <Stack spacing={0.4} sx={{ minWidth: 180 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Email
              </Typography>
              <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                {visitor?.emailAddress || "-"}
              </Typography>
            </Stack>

            <Stack spacing={0.4} sx={{ minWidth: 140 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Phone
              </Typography>
              <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                {visitor?.phoneNumber || "-"}
              </Typography>
            </Stack>

            <Stack spacing={0.4} sx={{ minWidth: 180 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Location
              </Typography>
              <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                {locationLabel}
              </Typography>
            </Stack>

            <Stack spacing={0.4}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Last Seen
              </Typography>
              <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                {toDateLabel(visitor?.lastSeenAt || visitor?.updatedAt || null)}
              </Typography>
            </Stack>
          </Stack>
        )}
      </Paper>

      <ReusableTable
        title="Chat Histories"
        subtitle="Ended and active conversations mapped to this visitor"
        rows={conversations}
        columns={columns}
        getRowKey={(row) => String(row._id)}
        loading={isLoading}
        loadingLabel="Loading chat histories..."
        search={{ show: false }}
        pagination={{
          page,
          rowsPerPage: ROWS_PER_PAGE,
          totalRows: pagination?.totalCount ?? conversations.length,
          onPageChange: setPage,
        }}
        emptyStateTitle="No conversations yet"
        emptyStateDescription="This visitor has no conversation history yet."
        totalLabel="conversations"
      />

      <Dialog
        open={Boolean(messageDialog)}
        onClose={() => setMessageDialog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {messageDialog?.title || "Conversation"} Messages
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {isMessagesLoading ? (
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ py: 4 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Loading messages...
              </Typography>
            </Stack>
          ) : null}

          {!isMessagesLoading && messagesError ? (
            <Alert severity="error">Failed to load messages for this conversation.</Alert>
          ) : null}

          {!isMessagesLoading && !messagesError && messages.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
              No messages were found for this conversation.
            </Typography>
          ) : null}

          {!isMessagesLoading && !messagesError && messages.length > 0 ? (
            <Stack spacing={1.25} sx={{ py: 1 }}>
              {messages.map((message) => {
                const isVisitor = message.senderType === "VISITOR";

                return (
                  <Box
                    key={message._id}
                    sx={(theme) => ({
                      px: 1.5,
                      py: 1,
                      borderRadius: 1.5,
                      bgcolor: isVisitor
                        ? theme.palette.action.hover
                        : theme.palette.primary.light,
                    })}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                        {getMessageSenderLabel(message)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {toDateLabel(message.createdAt)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: "text.primary", mt: 0.4 }}>
                      {message.message}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default VisitorDetailsSection;
