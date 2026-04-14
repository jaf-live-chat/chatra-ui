import { useMemo, useState } from "react";
import { ArrowLeft, MessageSquare, UserRound, Mail, Phone, MapPin, Clock } from "lucide-react";
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

const getConversationCode = (conversationId: string) => `CHAT_${String(conversationId || "").slice(-7).toUpperCase()}`;

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

const toShortDateLabel = (value?: string | null) => {
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

const resolveStatusLabel = (status?: string) => {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "WAITING") return "Waiting";
  if (normalizedStatus === "OPEN") return "Active";
  if (normalizedStatus === "ENDED") return "Ended";
  return "Unknown";
};

const getDurationLabel = (conversation: VisitorConversationHistory) => {
  const startSource = conversation.assignedAt || conversation.queuedAt || conversation.createdAt;
  const endSource = conversation.closedAt || conversation.updatedAt;

  if (!startSource || !endSource) {
    return "-";
  }

  const start = new Date(startSource).getTime();
  const end = new Date(endSource).getTime();

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return "-";
  }

  const totalMinutes = Math.floor((end - start) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
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

  const stats = useMemo(() => {
    const totalConversations = conversations.length;
    const totalMessages = conversations.reduce((accumulator, conversation) => {
      return accumulator + Number(conversation.history?.messageCount || 0);
    }, 0);

    const activeConversations = conversations.filter((conversation) => {
      return String(conversation.status || "").toUpperCase() !== "ENDED";
    }).length;

    const latestConversation = conversations[0]?.updatedAt || conversations[0]?.createdAt || null;

    return {
      totalConversations,
      totalMessages,
      activeConversations,
      latestConversation,
    };
  }, [conversations]);

  const columns: ReusableTableColumn<VisitorConversationHistory>[] = [
    {
      id: "timeline",
      label: "TIMELINE",
      sortable: true,
      sortAccessor: (conversation) => new Date(conversation.updatedAt || conversation.createdAt || 0),
      renderCell: (conversation) => (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 160 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: 1,
              bgcolor: resolveStatusColor(conversation.status) === "success" ? "success.main" : resolveStatusColor(conversation.status) === "warning" ? "warning.main" : "info.main",
            }}
          />
          <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700, fontSize: 13 }}>
            {toDateLabel(conversation.updatedAt || conversation.closedAt || conversation.createdAt || null)}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "conversation",
      label: "CONVERSATION ID",
      sortable: true,
      sortAccessor: (conversation) => new Date(conversation.updatedAt || conversation.createdAt || 0),
      renderCell: (conversation) => (
        <Box sx={{ minWidth: 150 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: 13 }}>
            {getConversationCode(String(conversation._id || ""))}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.2, display: "block", fontSize: 11 }}>
            {conversation.history?.messageCount || 0} messages
          </Typography>
        </Box>
      ),
    },
    {
      id: "agent",
      label: "AGENT",
      sortable: true,
      sortAccessor: (conversation) => resolveAgentName(conversation),
      renderCell: (conversation) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={(theme) => ({
              width: 28,
              height: 28,
              bgcolor: conversation.agentId ? theme.palette.primary.main : theme.palette.action.disabledBackground,
              color: conversation.agentId ? theme.palette.primary.contrastText : theme.palette.text.secondary,
              fontSize: 11,
              fontWeight: 700,
            })}
          >
            {getInitials(resolveAgentName(conversation))}
          </Avatar>
          <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700, fontSize: 13 }}>
            {resolveAgentName(conversation)}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "history",
      label: "LAST MESSAGE",
      renderCell: (conversation) => (
        <Box
          sx={{
            py: 1,
            px: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            maxWidth: 300,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13 }}>
            "{conversation.history?.lastMessage || "No messages"}"
          </Typography>
        </Box>
      ),
    },
    {
      id: "action",
      label: "ACTION",
      align: "right",
      headerAlign: "right",
      renderCell: (conversation) => (
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            setMessageDialog({
              conversationId: String(conversation._id || ""),
              title: getConversationCode(String(conversation._id || "")),
            });
          }}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1, minWidth: 90, fontSize: 12 }}
        >
          View Chat
        </Button>
      ),
    },
  ];

  if (!id) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
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
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1}}
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
          borderRadius: 1,
          p: { xs: 2, md: 3 },
          bgcolor: "background.paper",
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
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={3}
              alignItems={{ xs: "flex-start", lg: "center" }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={(theme) => ({
                    width: 58,
                    height: 58,
                    bgcolor: "teal",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                  })}
                >
                  {getInitials(visitorName)}
                </Avatar>

                <Stack spacing={0.5}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.1 }}>
                    {visitorName}
                  </Typography>
                  <Box>
                    <Chip
                      size="small"
                      label={idLabel(String(visitor?._id || ""), "VISITOR")}
                      sx={{ fontWeight: 700, borderRadius: 1 }}
                    />
                  </Box>
                </Stack>
              </Stack>

              <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                gap={2.5}
              >
                <Stack direction="row" spacing={2}>
                  <Box sx={{ color: "text.secondary", mt: 0.5 }}>
                    <Mail size={16} />
                  </Box>
                  <Stack>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.65rem", letterSpacing: 0.5 }}>
                      EMAIL ADDRESS
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700, fontSize: "0.8rem" }}>
                      {visitor?.emailAddress || "-"}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Box sx={{ color: "text.secondary", mt: 0.5 }}>
                    <Phone size={16} />
                  </Box>
                  <Stack>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.65rem", letterSpacing: 0.5 }}>
                      PHONE NUMBER
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700, fontSize: "0.8rem" }}>
                      {visitor?.phoneNumber || "-"}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Box sx={{ color: "text.secondary", mt: 0.5 }}>
                    <MapPin size={16} />
                  </Box>
                  <Stack>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.65rem", letterSpacing: 0.5 }}>
                      LOCATION
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700, fontSize: "0.8rem" }}>
                      {locationLabel}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Box sx={{ color: "text.secondary", mt: 0.5 }}>
                    <Clock size={16} />
                  </Box>
                  <Stack>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.65rem", letterSpacing: 0.5 }}>
                      LAST SEEN
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700, fontSize: "0.8rem" }}>
                      {toShortDateLabel(visitor?.lastSeenAt || visitor?.updatedAt || null)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>

            <Box sx={{ borderTop: 1, borderColor: "divider" }} />

            <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between">
              <Stack flex={1}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.65rem", letterSpacing: 0.5 }}>
                  CONVERSATIONS
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", mt: 0.5 }}>
                  {pagination?.totalCount ?? stats.totalConversations}
                </Typography>
              </Stack>

              <Stack flex={1}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.65rem", letterSpacing: 0.5 }}>
                  TOTAL MESSAGES
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", mt: 0.5 }}>
                  {stats.totalMessages}
                </Typography>
              </Stack>

              <Stack flex={1}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.65rem", letterSpacing: 0.5 }}>
                  ACTIVE CONVERSATIONS
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", mt: 0.5 }}>
                  {stats.activeConversations}
                </Typography>
              </Stack>

              <Stack flex={1.5}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.65rem", letterSpacing: 0.5 }}>
                  LAST ACTIVITY
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", mt: 0.5 }}>
                  {toDateLabel(stats.latestConversation)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        )}
      </Paper>

      <ReusableTable
        title="Conversation Timeline"
        subtitle="A compact history of all interactions with this visitor"
        headerIcon={<MessageSquare size={16} className="text-cyan-600 dark:text-cyan-400" />}
        rows={conversations}
        columns={columns}
        getRowKey={(row) => String(row._id)}
        loading={isLoading}
        loadingLabel="Loading chat histories..."
        tableMinWidth={980}
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
            <Stack spacing={1.4} sx={{ py: 1.2 }}>
              {messages.map((message) => {
                const isVisitor = message.senderType === "VISITOR";

                return (
                  <Stack
                    key={message._id}
                    alignItems={isVisitor ? "flex-start" : "flex-end"}
                    spacing={0.5}
                  >
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <Chip
                        label={getMessageSenderLabel(message)}
                        size="small"
                        color={isVisitor ? "default" : "primary"}
                        sx={{ height: 22, fontWeight: 700 }}
                      />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {toDateLabel(message.createdAt)}
                      </Typography>
                    </Stack>

                    <Box
                      sx={(theme) => ({
                        px: 1.5,
                        py: 1,
                        borderRadius: 1,
                        maxWidth: "86%",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: isVisitor
                          ? theme.palette.action.hover
                          : theme.palette.primary.main,
                        color: isVisitor
                          ? theme.palette.text.primary
                          : theme.palette.primary.contrastText,
                      })}
                    >
                      <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                        {message.message}
                      </Typography>
                    </Box>
                  </Stack>
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
