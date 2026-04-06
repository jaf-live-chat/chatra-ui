import React, { useState, useEffect, useMemo } from "react";
import {
  Bot,
  Hand,
  Settings2,
  CheckCircle2,
  Activity,
  AlertCircle,
  Info,
} from "lucide-react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Slider from "@mui/material/Slider";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import PageTitle from "../../components/common/PageTitle";
import TitleTag from "../../components/TitleTag";

// ─── Types ───────────────────────────────────────────────────────────────────

type AssignMode = "auto" | "manual";

interface QueueAssignmentSettings {
  mode: AssignMode;
  maxChatsPerAgent: number;
}

// Mock agent data (in a real app, this would come from props or API)
const availableAgents = [
  { id: "AGT-001", name: "Sarah Chen",     status: "online", activeChats: 2 },
  { id: "AGT-002", name: "Mike Johnson",   status: "online", activeChats: 1 },
  { id: "AGT-003", name: "Emily Davis",    status: "online", activeChats: 3 },
  { id: "AGT-004", name: "James Wilson",   status: "away",   activeChats: 0 },
  { id: "AGT-005", name: "Ana Rodriguez",  status: "online", activeChats: 0 },
];

// ─── Component ───────────────────────────────────────────────────────────────

const QueueAssignmentSettingsPage = () => {
  const [assignMode, setAssignMode] = useState<AssignMode>("manual");
  const [maxChatsPerAgent, setMaxChatsPerAgent] = useState(5);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("jaf_queue_assignment_settings");
      if (stored) {
        const settings: QueueAssignmentSettings = JSON.parse(stored);
        setAssignMode(settings.mode);
        setMaxChatsPerAgent(settings.maxChatsPerAgent);
      }
    } catch (e) {
      console.error("Failed to load queue assignment settings:", e);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings: QueueAssignmentSettings = {
      mode: assignMode,
      maxChatsPerAgent,
    };
    localStorage.setItem("jaf_queue_assignment_settings", JSON.stringify(settings));
    
    // Dispatch event so QueueView can react to changes
    window.dispatchEvent(new Event("jaf_queue_settings_updated"));
  }, [assignMode, maxChatsPerAgent]);

  // Calculate agent availability stats
  const availableCount = useMemo(() => {
    return availableAgents.filter(a => a.status === "online" && a.activeChats < maxChatsPerAgent).length;
  }, [maxChatsPerAgent]);

  const totalOnline = useMemo(() => {
    return availableAgents.filter(a => a.status === "online").length;
  }, []);

  const averageLoad = useMemo(() => {
    const online = availableAgents.filter(a => a.status === "online");
    if (online.length === 0) return 0;
    const totalChats = online.reduce((sum, a) => sum + a.activeChats, 0);
    return Math.round((totalChats / online.length) * 10) / 10;
  }, []);

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
            label={assignMode === "auto" ? "Automatic" : "Manual"}
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

      {/* Status Overview */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
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
            background: "linear-gradient(135deg, #0891b210 0%, #0891b204 100%)",
            borderBottom: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Activity size={18} color="#0891b2" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "grey.900" }}>
              Current Status
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            {/* Available Agents */}
            <Box sx={{ flex: 1, p: 2.5, border: "1px solid", borderColor: "grey.200", borderRadius: 2, bgcolor: "grey.50" }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 1 }}>
                Available Agents
              </Typography>
              <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1.5 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "primary.main" }}>
                  {availableCount}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  of {totalOnline} online
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={totalOnline > 0 ? (availableCount / totalOnline) * 100 : 0}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "grey.200",
                  "& .MuiLinearProgress-bar": { bgcolor: "primary.main", borderRadius: 3 },
                }}
              />
            </Box>

            {/* Average Load */}
            <Box sx={{ flex: 1, p: 2.5, border: "1px solid", borderColor: "grey.200", borderRadius: 2, bgcolor: "grey.50" }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 1 }}>
                Average Chat Load
              </Typography>
              <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1.5 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "grey.900" }}>
                  {averageLoad}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  chats per agent
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(averageLoad / maxChatsPerAgent) * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: averageLoad >= maxChatsPerAgent * 0.8 ? "#eab308" : "#0891b2",
                    borderRadius: 3,
                  },
                }}
              />
            </Box>

            {/* Current Strategy */}
            <Box sx={{ flex: 1, p: 2.5, border: "1px solid", borderColor: "grey.200", borderRadius: 2, bgcolor: "grey.50" }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 1 }}>
                Active Strategy
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "grey.900", mb: 0.5 }}>
                {assignMode === "auto"
                  ? "Automatic Assignment"
                  : "Manual Assignment"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                {assignMode === "auto"
                  ? "System assigns agents based on availability"
                  : "Agents are assigned manually per visitor"}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

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
                { mode: "auto" as const, label: "Automatic", sub: "System assigns agents", desc: "Incoming visitors are automatically routed to the next available agent. Each agent handles one customer at a time.", icon: <Bot size={18} /> },
                { mode: "manual" as const, label: "Manual", sub: "You choose the agent", desc: "You manually pick which agent handles each visitor from the queue. Gives you full control over assignments.", icon: <Hand size={18} /> },
              ].map(opt => (
                <Box
                  key={opt.mode}
                  onClick={() => setAssignMode(opt.mode)}
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2.5,
                    borderRadius: 2.5,
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: assignMode === opt.mode ? "primary.main" : "grey.200",
                    bgcolor: assignMode === opt.mode ? "#0891b20a" : "background.paper",
                    transition: "all 0.15s",
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
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {opt.sub}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.disabled", mt: 0.5, display: "block" }}>
                      {opt.desc}
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


