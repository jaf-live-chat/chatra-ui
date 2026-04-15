import { useState, useCallback } from "react";
import { ChatMessage } from "@/models/ChatSessionManagementModel";

interface TranscriptState {
  open: boolean;
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

const initialState: TranscriptState = {
  open: false,
  chatId: "",
  status: "WAITING",
  visitorName: "",
  agentName: "",
  messages: [],
  startDate: new Date().toISOString(),
};

export const useTranscriptModal = () => {
  const [state, setState] = useState<TranscriptState>(initialState);

  const openTranscript = useCallback(
    (data: Omit<TranscriptState, "open">) => {
      setState((prev) => ({
        ...prev,
        ...data,
        open: true,
      }));
    },
    []
  );

  const closeTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  return {
    ...state,
    openTranscript,
    closeTranscript,
  };
};
