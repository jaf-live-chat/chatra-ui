import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import { X } from "lucide-react";
import ChatTranscript from "@/components/ChatTranscript";
import { ChatMessage } from "@/models/ChatSessionManagementModel";

interface ViewTranscriptModalProps {
  open: boolean;
  onClose: () => void;
  chatId: string;
  status: "WAITING" | "OPEN" | "ENDED";
  visitorName: string;
  agentName: string;
  messages: ChatMessage[];
  startDate: string;
  visitorAvatar?: string;
  agentAvatar?: string;
  showTypingIndicator?: boolean;
}

const ViewTranscriptModal = ({
  open,
  onClose,
  chatId,
  status,
  visitorName,
  agentName,
  messages,
  startDate,
  visitorAvatar = "V",
  agentAvatar = "A",
  showTypingIndicator = false,
}: ViewTranscriptModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "grey.200",
          p: 2,
        }}
      >
        <span style={{ fontSize: "1rem", fontWeight: 600 }}>Chat Transcript</span>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "text.secondary", "&:hover": { bgcolor: "grey.100" } }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, overflow: "hidden", height: "calc(90vh - 60px)" }}>
        <ChatTranscript
          chatId={chatId}
          status={status}
          visitorName={visitorName}
          agentName={agentName}
          messages={messages}
          startDate={startDate}
          visitorAvatar={visitorAvatar}
          agentAvatar={agentAvatar}
          showTypingIndicator={showTypingIndicator}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ViewTranscriptModal;
