import React, { useState, useEffect } from "react";
import {
  Bot,
  Hand,
  Settings2,
  CheckCircle2,
} from "lucide-react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import PageTitle from "../../components/common/PageTitle";
import TitleTag from "../../components/TitleTag";
import chatSettingsServices, { useGetQueueAssignmentMode } from "../../services/chatSettingsServices";
import type { QueueAssignmentMode } from "../../models/ChatSettingsModel";
import { toast } from "../../components/sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type AssignMode = "auto" | "manual";

interface QueueAssignmentSettings {
  mode: AssignMode;
  maxChatsPerAgent: number;
}

const mapAssignModeToApiMode = (mode: AssignMode): QueueAssignmentMode =>
  mode === "auto" ? "ROUND_ROBIN" : "MANUAL";

const mapApiModeToAssignMode = (mode?: QueueAssignmentMode): AssignMode =>
  mode === "ROUND_ROBIN" ? "auto" : "manual";

const getRequestErrorMessage = (error: unknown): string => {
  const message = (error as { response?: { data?: { message?: string } } })
    ?.response?.data?.message;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return "Failed to update assignment mode. Please try again.";
};

const ASSIGNMENT_MODE_DESCRIPTIONS: Record<QueueAssignmentMode, string> = {
  ROUND_ROBIN: "Incoming visitors are automatically routed to support agents only in round-robin order. Admins can still manually assign or take any waiting chat.",
  MANUAL: "Incoming visitors remain in waiting queue until staff action. Admins can manually assign or take chats at any time.",
};

const ASSIGNMENT_MODE_LABELS: Record<QueueAssignmentMode, string> = {
  ROUND_ROBIN: "Round Robin",
  MANUAL: "Manual",
};

// ─── Component ───────────────────────────────────────────────────────────────

const QueueAssignmentSettingsPage = () => {
  const [assignMode, setAssignMode] = useState<AssignMode>("auto");
  const [isSavingMode, setIsSavingMode] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { chatSettings, isLoading } = useGetQueueAssignmentMode();

  // Load from API and set local UI state
  useEffect(() => {
    if (chatSettings?.assignmentMode) {
      const mode = mapApiModeToAssignMode(chatSettings.assignmentMode);
      setAssignMode(mode);
    }
  }, [chatSettings]);

  // Keep queue view consumers synced via local storage + window event
  useEffect(() => {
    const settings: QueueAssignmentSettings = {
      mode: assignMode,
      maxChatsPerAgent: 5,
    };
    localStorage.setItem("jaf_queue_assignment_settings", JSON.stringify(settings));
    window.dispatchEvent(new Event("jaf_queue_settings_updated"));
  }, [assignMode]);

  const handleAssignmentModeChange = async (nextMode: AssignMode) => {
    if (nextMode === assignMode || isSavingMode) {
      return;
    }

    const previousMode = assignMode;
    setSaveError(null);
    setAssignMode(nextMode);
    setIsSavingMode(true);

    try {
      const response = await chatSettingsServices.updateQueueAssignmentMode({
        assignmentMode: mapAssignModeToApiMode(nextMode),
      });

      setAssignMode(mapApiModeToAssignMode(response.chatSettings?.assignmentMode));
      toast.success("Assignment mode updated.");
    } catch (error) {
      const message = getRequestErrorMessage(error);
      setAssignMode(previousMode);
      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSavingMode(false);
    }
  };



  return (
    <React.Fragment>
      <PageTitle
        title="Queue Assignment Settings"
        description="Configure how incoming visitors are assigned to support agents"
        canonical="/portal/queue-assignment"

      />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
            <TitleTag
              title="Queue Assignment Settings"
              subtitle="Configure how incoming visitors are assigned to support agents"
              icon={<Settings2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
            />
            <Chip
              label={isSavingMode ? "Saving..." : ASSIGNMENT_MODE_LABELS[mapAssignModeToApiMode(assignMode)]}
              size="medium"
              sx={{
                alignSelf: "center",
                height: 32,
                fontSize: "0.8rem",
                fontWeight: 800,
                letterSpacing: "0.04em",
                bgcolor: assignMode === "auto" ? "#0891b218" : "grey.100",
                color: assignMode === "auto" ? "#0e7490" : "grey.600",
                "& .MuiChip-label": { px: 2 },
              }}
            />
          </Stack>
        </Box>

        {saveError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {saveError}
          </Alert>
        ) : null}

        {/* Main Settings */}
        <Stack spacing={3}>
          {/* Assignment Mode Card */}
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2.5,
                background: "linear-gradient(135deg, #11111108 0%, #11111103 100%)",
                borderBottom: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Bot size={18} color="#6b7280" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "grey.900" }}>
                  Assignment Mode
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 4 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {[
                  { mode: "auto" as const, apiMode: "ROUND_ROBIN" as const, label: "Round Robin", icon: <Bot size={18} /> },
                  { mode: "manual" as const, apiMode: "MANUAL" as const, label: "Manual", icon: <Hand size={18} /> },
                ].map(opt => (
                  <Box
                    key={opt.mode}
                    onClick={() => {
                      void handleAssignmentModeChange(opt.mode);
                    }}
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2.5,
                      borderRadius: 2.5,
                      cursor: isSavingMode || isLoading ? "not-allowed" : "pointer",
                      opacity: isSavingMode || isLoading ? 0.7 : 1,
                      border: "2px solid",
                      borderColor: assignMode === opt.mode ? "primary.main" : "grey.200",
                      bgcolor: assignMode === opt.mode ? "#0891b20a" : "background.paper",
                      transition: "all 0.15s",
                      pointerEvents: isSavingMode || isLoading ? "none" : "auto",
                      "&:hover": { borderColor: assignMode === opt.mode ? "primary.main" : "grey.300" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: assignMode === opt.mode ? "primary.main" : "grey.100",
                        color: assignMode === opt.mode ? "#fff" : "grey.500",
                        transition: "all 0.15s",
                      }}
                    >
                      {opt.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "grey.900", lineHeight: 1.2, mb: 0.5 }}>
                        {opt.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem", mt: 0.5, display: "block" }}>
                        {ASSIGNMENT_MODE_DESCRIPTIONS[opt.apiMode]}
                      </Typography>
                    </Box>
                    {assignMode === opt.mode && <CheckCircle2 size={20} color="#0891b2" />}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </React.Fragment>
  );
}

export default QueueAssignmentSettingsPage;


