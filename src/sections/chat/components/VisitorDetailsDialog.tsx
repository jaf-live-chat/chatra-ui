import { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, MessageSquare, UserRound, X } from "lucide-react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { USER_ROLES, USER_STATUS } from "../../../constants/constants";
import type { LiveChatMessage } from "../../../models/LiveChatModel";
import type { QueueActorRole, QueueVisitorRow } from "../../../models/QueueViewModel";
import liveChatServices from "../../../services/liveChatServices";
import { formatElapsedTime } from "../../../utils/liveChatQueueTime";

interface VisitorDetailsDialogProps {
  open: boolean;
  visitor: QueueVisitorRow | null;
  now: number;
  actorRole?: QueueActorRole;
  actorStatus?: string;
  selfPickEligible?: boolean;
  isProcessingAction?: boolean;
  onClose: () => void;
  onStartChat?: (visitor: QueueVisitorRow) => void;
  onTakeConversation?: (visitor: QueueVisitorRow) => Promise<void>;
  onSelfPickConversation?: (visitor: QueueVisitorRow) => Promise<void>;
  onOpenAssignDialog?: (visitor: QueueVisitorRow) => void;
}

const getAvatarColor = (id: string) => {
  const avatarColors = ["#0891b2", "#1F75FE", "#A855F7", "#B48600", "#16a34a", "#FF5A1F"];
  const charCode = id.charCodeAt(id.length - 1) || 0;
  return avatarColors[charCode % avatarColors.length];
};

const getSenderLabel = (senderType: string) => {
  if (senderType === "VISITOR") {
    return "Visitor";
  }

  return "Agent";
};

const VisitorDetailsDialog = ({
  open,
  visitor,
  now,
  actorRole,
  actorStatus,
  selfPickEligible = false,
  isProcessingAction = false,
  onClose,
  onStartChat,
  onTakeConversation,
  onSelfPickConversation,
  onOpenAssignDialog,
}: VisitorDetailsDialogProps) => {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !visitor?.conversationId) {
      return;
    }

    let active = true;

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      setMessageError(null);

      try {
        const response = await liveChatServices.getConversationMessages(visitor.conversationId, {
          page: 1,
          limit: 100,
        });

        if (!active) {
          return;
        }

        setMessages(response.messages);
      } catch (error) {
        if (!active) {
          return;
        }

        setMessageError("Failed to load conversation messages.");
      } finally {
        if (active) {
          setIsLoadingMessages(false);
        }
      }
    };

    void fetchMessages();

    return () => {
      active = false;
    };
  }, [open, visitor?.conversationId]);

  const location = useMemo(() => {
    const city = visitor?.location || "Unknown";
    const country = visitor?.country || "Unknown";
    return `${city}, ${country}`;
  }, [visitor?.country, visitor?.location]);

  const isWaitingVisitor = visitor?.status === "Waiting";
  const isAdminOrMaster = actorRole === USER_ROLES.ADMIN.value || actorRole === USER_ROLES.MASTER_ADMIN.value;
  const isSupportAgent = actorRole === USER_ROLES.SUPPORT_AGENT.value;
  const canSelfPick = isSupportAgent && actorStatus === USER_STATUS.AVAILABLE && selfPickEligible;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          background: "linear-gradient(135deg, #0891b214 0%, #0891b205 100%)",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: visitor ? getAvatarColor(visitor.id) : "grey.300",
              fontWeight: 700,
            }}
          >
            {visitor?.name?.charAt(0).toUpperCase() || "?"}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {visitor?.name || "Visitor"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Conversation Details
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <X size={18} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, color: "text.secondary" }}>
                <UserRound size={14} />
                <Typography variant="caption">Visitor</Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {visitor?.name || "Unknown Visitor"}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, color: "text.secondary" }}>
                <MapPin size={14} />
                <Typography variant="caption">Location</Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {location}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, color: "text.secondary" }}>
                <Clock size={14} />
                <Typography variant="caption">Waiting Time</Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatElapsedTime(visitor?.queuedAt, now)}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid", borderColor: "divider", bgcolor: "grey.50" }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <MessageSquare size={14} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Messages
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ px: 2, py: 1.5, maxHeight: 280, overflowY: "auto", bgcolor: "background.paper" }}>
              {isLoadingMessages ? (
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ py: 4 }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Loading messages...
                  </Typography>
                </Stack>
              ) : null}

              {!isLoadingMessages && messageError ? (
                <Typography variant="body2" sx={{ py: 2, color: "error.main", textAlign: "center" }}>
                  {messageError}
                </Typography>
              ) : null}

              {!isLoadingMessages && !messageError && messages.length === 0 ? (
                <Typography variant="body2" sx={{ py: 2, color: "text.secondary", textAlign: "center" }}>
                  No messages yet.
                </Typography>
              ) : null}

              {!isLoadingMessages && !messageError ? (
                <Stack spacing={1.25}>
                  {messages.map((item) => (
                    <Box key={item._id} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: item.senderType === "VISITOR" ? "#f1f5f9" : "#ecfeff" }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                          {getSenderLabel(item.senderType)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : ""}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ mt: 0.5, color: "text.primary" }}>
                        {item.message}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : null}
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
          Close
        </Button>

        {isWaitingVisitor && isAdminOrMaster && (
          <>
            <Button
              variant="outlined"
              disabled={!visitor || !onOpenAssignDialog || isProcessingAction}
              onClick={() => {
                if (visitor && onOpenAssignDialog) {
                  onOpenAssignDialog(visitor);
                }
              }}
              sx={{ fontWeight: 700 }}
            >
              Assign
            </Button>
            <Button
              variant="contained"
              disabled={!visitor || !onTakeConversation || isProcessingAction}
              onClick={() => {
                if (visitor && onTakeConversation) {
                  void onTakeConversation(visitor);
                }
              }}
              sx={{ fontWeight: 700 }}
            >
              Take Chat
            </Button>
          </>
        )}

        {isWaitingVisitor && isSupportAgent && (
          <Tooltip title={canSelfPick ? "Pick this waiting chat" : "Self-pick is allowed once after returning AVAILABLE from OFFLINE/AWAY."}>
            <span>
              <Button
                variant="contained"
                disabled={!visitor || !onSelfPickConversation || isProcessingAction || !canSelfPick}
                onClick={() => {
                  if (visitor && onSelfPickConversation) {
                    void onSelfPickConversation(visitor);
                  }
                }}
                sx={{ fontWeight: 700 }}
              >
                Self Pick
              </Button>
            </span>
          </Tooltip>
        )}

        {!isWaitingVisitor && (
          <Button
            variant="contained"
            disabled={!visitor || !onStartChat}
            onClick={() => {
              if (visitor && onStartChat) {
                onStartChat(visitor);
                onClose();
              }
            }}
            sx={{ fontWeight: 700 }}
          >
            Start Chat
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VisitorDetailsDialog;
