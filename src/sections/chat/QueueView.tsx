import React, { useState, useMemo, useEffect, useCallback, type CSSProperties, type ReactNode } from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  Check as CheckIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Globe,
  Hourglass,
  LayoutGrid,
  List,
  MapPin,
  MessageSquare,
  Monitor,
  Search,
  Smartphone,
  Tablet,
  UserPlus,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ReusableTable, { type ReusableTableColumn } from "../../components/ReusableTable";
import PageTitle from "../../components/common/PageTitle";
import TitleTag from "../../components/TitleTag";
import { toast } from "sonner";

type QueueAgentOption = {
  id: string;
  name: string;
  status: string;
  activeChats: number;
};

// ─── Live Data Inputs ────────────────────────────────────────────────────────

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getQueueDisplayId(id: string): string {
  const num = parseInt(id.replace(/\D/g, ''), 10) || 0;
  return `Q-${((num * 6173) % 9000) + 1000}`;
}

const avatarColors = ['#0891b2', '#1F75FE', '#A855F7', '#B48600', '#16a34a', '#FF5A1F'];
function getAvatarColor(id: string) {
  const charCode = id.charCodeAt(id.length - 1) || 0;
  return avatarColors[charCode % avatarColors.length];
}
function getDeviceIcon(type: string) {
  switch (type) {
    case "mobile": return <Smartphone size={14} />;
    case "tablet": return <Tablet size={14} />;
    default: return <Monitor size={14} />;
  }
}

// ─── Assignment Strategy ─────────────────────────────────────────────────────

// Simple auto-assignment: distribute evenly across available agents
function getAutoAssignAgent(queueIndex: number, maxChats: number, agents: QueueAgentOption[]) {
  const eligible = agents.filter(a => a.status === "online" && a.activeChats < maxChats);
  if (eligible.length === 0) return null;
  return eligible[queueIndex % eligible.length];
}

// ─── Component ───────────────────────────────────────────────────────────────

const QueueView = ({
  queue,
  onStartChat,
  isAgent = false,
  currentAgentId,
  onAssignConversation,
  onAcceptAssignment,
  agents: agentsProp,
}: {
  queue: any[];
  onStartChat?: (visitor: any) => void;
  isAgent?: boolean;
  currentAgentId?: string;
  onAssignConversation?: (visitor: any, agentId: string) => Promise<void>;
  onAcceptAssignment?: (assignment: any) => Promise<void>;
  agents?: QueueAgentOption[];
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [chatToConfirm, setChatToConfirm] = useState<any>(null);
  const [assignToConfirm, setAssignToConfirm] = useState<any>(null);
  const [acceptToConfirm, setAcceptToConfirm] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [visitorDetail, setVisitorDetail] = useState<any>(null);
  const [queuePage, setQueuePage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [visitorPage, setVisitorPage] = useState(1);
  const [queueViewMode, setQueueViewMode] = useState<"list" | "grid">("list");
  const itemsPerPage = 5;

  // Assignment mode state - load from localStorage (managed by QueueAssignmentSettingsPage)
  const [assignMode, setAssignMode] = useState<"auto" | "manual">("manual");
  const [maxChatsPerAgent, setMaxChatsPerAgent] = useState(5);

  const [isProcessingAssignment, setIsProcessingAssignment] = useState(false);

  const agents = useMemo(() => {
    if (Array.isArray(agentsProp) && agentsProp.length > 0) {
      return agentsProp;
    }

    return [];
  }, [agentsProp]);

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
    px: 1.4,
    borderColor: "grey.300",
    color: "grey.700",
    fontWeight: 600,
    height: 32,
    minWidth: 70,
    backgroundColor: "background.paper",
    "&:hover": { bgcolor: "grey.50", borderColor: "grey.400" },
  };

  const primaryButtonSx = {
    ...actionButtonSx,
    color: "primary.main",
    borderColor: "primary.light",
    "&:hover": { bgcolor: "#e0f2fe", borderColor: "primary.main" },
  };

  const dangerButtonSx = {
    ...actionButtonSx,
    color: "error.main",
    borderColor: "error.light",
    "&:hover": { bgcolor: "#fee2e2", borderColor: "error.main" },
  };

  const actionsHeaderLabel = <span style={visuallyHidden}>Actions</span>;

  // Derive assigned chats directly from queue data provided by backend.
  const myAgentAssignments = useMemo(() => {
    const assigned = queue.filter((item) => {
      if (item.status !== "Assigned") {
        return false;
      }

      if (!isAgent || !currentAgentId) {
        return true;
      }

      return String(item.agentId || "") === String(currentAgentId);
    });

    return assigned.map((item) => ({
      visitorId: item.id,
      conversationId: item.conversationId || item.id,
      visitorName: item.name,
      message: item.message,
      timeInQueue: item.timeInQueue,
      agentId: item.agentId,
      agentName: item.agentName || "Assigned Agent",
      status: "pending",
    }));
  }, [queue, isAgent, currentAgentId]);

  // Load queue assignment settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("jaf_queue_assignment_settings");
      if (stored) {
        const settings = JSON.parse(stored);
        setAssignMode(settings.mode || "manual");
        setMaxChatsPerAgent(settings.maxChatsPerAgent || 5);
      }
    } catch (e) { /* silently fail */ }
  }, []);

  // Listen for settings updates from QueueAssignmentSettingsPage
  useEffect(() => {
    const handleSettingsUpdate = () => {
      try {
        const stored = localStorage.getItem("jaf_queue_assignment_settings");
        if (stored) {
          const settings = JSON.parse(stored);
          setAssignMode(settings.mode || "manual");
          setMaxChatsPerAgent(settings.maxChatsPerAgent || 5);
        }
      } catch (e) { /* silently fail */ }
    };

    window.addEventListener("jaf_queue_settings_updated", handleSettingsUpdate);
    return () => window.removeEventListener("jaf_queue_settings_updated", handleSettingsUpdate);
  }, []);

  // Filtered queues
  const filter = (item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.message.toLowerCase().includes(searchTerm.toLowerCase());

  const waitingQueue = useMemo(() => {
    return queue.filter(i => {
      if (i.status !== "Waiting") return false;
      if (!filter(i)) return false;
      return true;
    });
  }, [queue, searchTerm]);
  const currentQueue = useMemo(() => queue.filter(i => i.status === "Assigned" && filter(i)), [queue, searchTerm]);
  const allFiltered = useMemo(() => queue.filter(filter), [queue, searchTerm]);

  const paginate = (arr: any[], page: number) => arr.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = (arr: any[]) => Math.ceil(arr.length / itemsPerPage);

  const waitingCount = queue.filter(q => q.status === "Waiting").length;
  const servedCount = queue.filter(q => q.status === "Assigned").length;

  // ── Sub-components ──

  const PaginationBar = ({
    current, total, onChange, count, label,
  }: { current: number; total: number; onChange: (p: number) => void; count: number; label: string }) =>
    total > 1 ? (
      <Box sx={{ px: 3, py: 1.5, borderTop: "1px solid", borderColor: "grey.200", bgcolor: "grey.50", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
          Showing{" "}
          <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: "grey.900", fontSize: "0.8rem" }}>
            {(current - 1) * itemsPerPage + 1}
          </Typography>
          –
          <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: "grey.900", fontSize: "0.8rem" }}>
            {Math.min(current * itemsPerPage, count)}
          </Typography>
          {" "}of{" "}
          <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: "grey.900", fontSize: "0.8rem" }}>
            {count}
          </Typography>
          {" "}{label}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton onClick={() => onChange(Math.max(1, current - 1))} disabled={current === 1} size="small"
            sx={{ border: "1px solid", borderColor: "grey.200", bgcolor: "background.paper", borderRadius: 1.5 }}>
            <ChevronLeft size={16} />
          </IconButton>
          {Array.from({ length: total }).map((_, i) => (
            <Button key={i} onClick={() => onChange(i + 1)}
              sx={{
                minWidth: 30, p: 0, height: 30, borderRadius: 1.5,
                bgcolor: current === i + 1 ? "primary.main" : "transparent",
                color: current === i + 1 ? "#ffffff" : "text.secondary",
                fontWeight: current === i + 1 ? 700 : 500, fontSize: "0.8rem",
                "&:hover": { bgcolor: current === i + 1 ? "primary.dark" : "grey.100" },
              }}>
              {i + 1}
            </Button>
          ))}
          <IconButton onClick={() => onChange(Math.min(total, current + 1))} disabled={current === total} size="small"
            sx={{ border: "1px solid", borderColor: "grey.200", bgcolor: "background.paper", borderRadius: 1.5 }}>
            <ChevronRight size={16} />
          </IconButton>
        </Stack>
      </Box>
    ) : null;

  const EmptyState = ({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) => (
    <TableRow>
      <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
        <Stack alignItems="center" spacing={1.5} sx={{ color: "text.secondary" }}>
          <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "grey.900" }}>{title}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>{subtitle}</Typography>
          </Box>
        </Stack>
      </TableCell>
    </TableRow>
  );

  const waitingGridColumns: ReusableTableColumn<any>[] = [
    {
      id: "position",
      label: "#",
      align: "center",
      headerAlign: "center",
      renderCell: (_row, index) => {
        const pos = index + 1;
        const isFirst = pos === 1;
        return (
          <Typography
            component="span"
            sx={{
              display: "inline-block",
              mx: "auto",
              fontWeight: 700,
              color: isFirst ? "primary.main" : "grey.700",
              fontSize: isFirst ? "0.85rem" : "0.75rem",
            }}
          >
            {pos}
          </Typography>
        );
      },
    },
    {
      id: "visitor",
      label: "VISITOR",
      renderCell: (row) => (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ width: 30, height: 30, bgcolor: getAvatarColor(row.id), fontSize: "0.78rem", fontWeight: 700 }}>
            {row.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "grey.900", lineHeight: 1.2 }}>
              {row.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
              {getQueueDisplayId(row.id)}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: "status",
      label: "STATUS",
      align: "center",
      headerAlign: "center",
      renderCell: () => (
        <Chip
          icon={<Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "warning.main", ml: 1 }} />}
          label="Waiting"
          size="small"
          sx={{ bgcolor: "#eab30820", color: "#7a5d00", fontWeight: 600, height: 22, "& .MuiChip-icon": { ml: 1 } }}
        />
      ),
    },
    {
      id: "action",
      label: actionsHeaderLabel,
      align: "center",
      headerAlign: "center",
      renderCell: (row, rowIndex) => {
        const autoAgent = assignMode === "auto" ? getAutoAssignAgent(rowIndex, maxChatsPerAgent, agents) : null;
        return (
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button
              size="small"
              variant="outlined"
              onClick={() => setChatToConfirm(row)}
              sx={primaryButtonSx}
            >
              Start
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                if (assignMode === "auto") {
                  if (!autoAgent) return;
                  setSelectedAgent(autoAgent.id);
                } else {
                  setSelectedAgent("");
                }
                setAssignToConfirm(row);
              }}
              disabled={assignMode === "auto" && !autoAgent}
              sx={actionButtonSx}
            >
              {assignMode === "auto" ? "Auto-Assign" : "Assign"}
            </Button>
          </Stack>
        );
      },
    },
  ];

  const activeGridColumns: ReusableTableColumn<any>[] = [
    {
      id: "position",
      label: "#",
      align: "center",
      headerAlign: "center",
      renderCell: (_row, index) => (
        <Typography
          component="span"
          sx={{
            display: "inline-block",
            mx: "auto",
            color: "primary.main",
            fontWeight: 700,
            fontSize: "0.75rem",
          }}
        >
          {index + 1}
        </Typography>
      ),
    },
    {
      id: "visitor",
      label: "VISITOR",
      renderCell: (row) => (
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <Box sx={{ position: "relative" }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: getAvatarColor(row.id), fontSize: "0.72rem", fontWeight: 700 }}>
              {row.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderRadius: "50%", bgcolor: "#16a34a", border: "1px solid #fff" }} />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900", lineHeight: 1.2 }}>
              {row.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.66rem" }}>
              {getQueueDisplayId(row.id)}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: "status",
      label: "STATUS",
      align: "center",
      headerAlign: "center",
      renderCell: () => (
        <Chip
          icon={<Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main", ml: 1 }} />}
          label="Active"
          size="small"
          sx={{ bgcolor: "#16a34a1f", color: "#15803d", fontWeight: 600, height: 22, "& .MuiChip-icon": { ml: 1 } }}
        />
      ),
    },
    {
      id: "action",
      label: actionsHeaderLabel,
      align: "center",
      headerAlign: "center",
      renderCell: (row) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            size="small"
            variant="outlined"
            onClick={() => { if (onStartChat) onStartChat(row); }}
            sx={actionButtonSx}
          >
            View
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setAssignToConfirm(row);
              setSelectedAgent("");
            }}
            sx={primaryButtonSx}
          >
            Transfer
          </Button>
        </Stack>
      ),
    },
  ];

  const visitorGridColumns: ReusableTableColumn<any>[] = [
    {
      id: "visitor",
      label: "VISITOR",
      renderCell: (row) => (
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <Avatar sx={{ width: 28, height: 28, bgcolor: getAvatarColor(row.id), fontSize: "0.72rem", fontWeight: 700 }}>
            {row.name.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900" }}>{row.name}</Typography>
        </Stack>
      ),
    },
    {
      id: "ip",
      label: "IP ADDRESS",
      renderCell: (row) => {
        const ip = row.ipAddress || "-";
        return (
          <Typography variant="body2" sx={{ color: "grey.700", fontFamily: "monospace", fontSize: "0.75rem" }}>
            {ip}
          </Typography>
        );
      },
    },
    {
      id: "action",
      label: actionsHeaderLabel,
      align: "center",
      headerAlign: "center",
      renderCell: (row) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => setVisitorDetail(row)}
          sx={primaryButtonSx}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageTitle
        title="Queue Management"
        description="View and manage your live chat queue, visitor details, and agent assignments all in one place."
        canonical="/portal/queue-management"
      />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, overflowX: "hidden" }}>

        {/* ── Agent notice banner ── */}
        {isAgent && (
          <Paper elevation={0} sx={{
            p: 2, borderRadius: 2.5, border: "1px solid #0891b230",
            bgcolor: "#0891b20a",
            display: "flex", alignItems: "center", gap: 1.5,
          }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: "#0891b220", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Hourglass size={16} color="#0891b2" />
            </Box>
            <Typography variant="body2" sx={{ color: "#0e7490", fontSize: "0.82rem" }}>
              You can only chat with visitors that have been <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: "#0e7490", fontSize: "0.82rem" }}>assigned to you by an admin</Typography>. Look for chats in the "Assigned to You" section below and click <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: "#16a34a", fontSize: "0.82rem" }}>Accept</Typography> to begin.
            </Typography>
          </Paper>
        )}

        {/* ── Header ── */}
        <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" spacing={2}>
          <TitleTag
            title={isAgent ? "Your Queue" : "Customer Queue"}
            subtitle={isAgent ? "Accept chats assigned to you by the admin to start a live session" : "Manage visitors waiting in queue and monitor active sessions"}
            icon={<MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
          />
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flexWrap: "wrap", justifyContent: "flex-end", width: { xs: "100%", md: "auto" } }}>
            <Stack direction="row" spacing={1}>
              <Chip icon={<Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "warning.main", ml: 0.5 }} />}
                label={`${waitingCount} Waiting`} size="small"
                sx={{
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "#854d0e" : "#eab30814"),
                  color: (theme) => (theme.palette.mode === "dark" ? "#ffffff" : "#7a5d00"),
                  fontWeight: 600,
                  "& .MuiChip-icon": { ml: 0.5 },
                }} />
              <Chip icon={<Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "primary.main", ml: 0.5 }} />}
                label={`${servedCount} Active`} size="small"
                sx={{
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "#991b1b" : "#dc262619"),
                  color: (theme) => (theme.palette.mode === "dark" ? "#ffffff" : theme.palette.primary.dark),
                  fontWeight: 600,
                  "& .MuiChip-icon": { ml: 0.5 },
                }} />
              <Chip icon={<Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "grey.400", ml: 0.5 }} />}
                label={`${queue.length} Total`} size="small"
                sx={{
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "#334155" : theme.palette.grey[100]),
                  color: (theme) => (theme.palette.mode === "dark" ? "#ffffff" : theme.palette.grey[700]),
                  fontWeight: 600,
                  "& .MuiChip-icon": { ml: 0.5 },
                }} />
            </Stack>
            <Box sx={{ position: "relative", width: { xs: "100%", md: 240 } }}>
              <Box sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "text.secondary", display: "flex" }}>
                <Search size={16} />
              </Box>
              <InputBase
                placeholder="Search visitors..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setQueuePage(1); setCurrentPage(1); setVisitorPage(1); }}
                sx={{
                  width: "100%", pl: 4.5, pr: 2, py: 1,
                  bgcolor: "background.paper", border: "1px solid", borderColor: "grey.200",
                  borderRadius: 2, fontSize: "0.85rem",
                  "&.Mui-focused": { borderColor: "primary.main", boxShadow: "0 0 0 2px #0891b226" },
                }}
                fullWidth
              />
            </Box>
            {!isAgent && (
              <Stack direction="row" spacing={0.5} sx={{ p: 0.5, border: "1px solid", borderColor: "grey.200", borderRadius: 2, bgcolor: "#fff" }}>
                <Tooltip title="List view">
                  <IconButton
                    onClick={() => setQueueViewMode("list")}
                    size="small"
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor: queueViewMode === "list" ? "#0891b214" : "transparent",
                      color: queueViewMode === "list" ? "#0891b2" : "text.secondary",
                      border: queueViewMode === "list" ? "1px solid #0891b233" : "1px solid transparent",
                    }}
                  >
                    <List size={15} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Grid view">
                  <IconButton
                    onClick={() => setQueueViewMode("grid")}
                    size="small"
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor: queueViewMode === "grid" ? "#0891b214" : "transparent",
                      color: queueViewMode === "grid" ? "#0891b2" : "text.secondary",
                      border: queueViewMode === "grid" ? "1px solid #0891b233" : "1px solid transparent",
                    }}
                  >
                    <LayoutGrid size={15} />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>
        </Stack>

        {!isAgent && queueViewMode === "grid" && (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1.2fr) minmax(0,1.05fr) minmax(0,1.05fr)" }, gap: 2 }}>
            <ReusableTable
              title="Waiting Queue"
              subtitle="Visitors waiting for an agent"
              rows={waitingQueue}
              columns={waitingGridColumns}
              getRowKey={(row) => row.id}
              tableMinWidth={0}
              tableLayout="fixed"
              compact={true}
              noHorizontalScroll={true}
              search={{ show: false }}
              pagination={{ show: true, rowsPerPage: 5, totalRows: waitingQueue.length }}
              headerIcon={<Hourglass size={17} />}
              totalLabel="waiting"
            />

            <ReusableTable
              title="Currently Being Served"
              subtitle="Active sessions assigned to agents"
              rows={currentQueue}
              columns={activeGridColumns}
              getRowKey={(row) => row.id}
              tableMinWidth={0}
              tableLayout="fixed"
              compact={true}
              noHorizontalScroll={true}
              search={{ show: false }}
              pagination={{ show: true, rowsPerPage: 5, totalRows: currentQueue.length }}
              headerIcon={<Zap size={17} />}
              totalLabel="active"
            />

            <ReusableTable
              title="Visitor Details"
              subtitle="IP addresses, geolocation, and devices"
              rows={allFiltered}
              columns={visitorGridColumns}
              getRowKey={(row) => row.id}
              tableMinWidth={0}
              tableLayout="fixed"
              compact={true}
              noHorizontalScroll={true}
              search={{ show: false }}
              pagination={{ show: true, rowsPerPage: 5, totalRows: allFiltered.length }}
              headerIcon={<Globe size={17} />}
              totalLabel="visitors"
            />
          </Box>
        )}

        {/* ════════════════════ TABLE 2 — ASSIGNED TO YOU (agent: shown first) ════════════════════ */}
        {isAgent && (
          <Paper elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{
              px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid", borderColor: "grey.200",
              background: "linear-gradient(135deg, #dc262614 0%, #dc262605 100%)",
            }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "#dc26261a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Zap size={17} color="#0891b2" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "grey.900", lineHeight: 1.2 }}>Assigned to You</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>Chats assigned by admin — accept to start</Typography>
                </Box>
              </Stack>
              <Chip label={`${myAgentAssignments.filter(a => a.status === "pending").length} active`} size="small"
                sx={{ bgcolor: "#dc26261a", color: "primary.dark", fontWeight: 700, height: 26 }} />
            </Box>
            <TableContainer sx={{ overflow: "visible" }}>
              <Table>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell width="8%" align="center">#</TableCell>
                    <TableCell width="22%">Visitor</TableCell>
                    <TableCell width="35%">Message</TableCell>
                    <TableCell width="15%" align="center">Session Time</TableCell>
                    <TableCell width="10%" align="center">Status</TableCell>
                    <TableCell width="10%" align="center">{actionsHeaderLabel}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myAgentAssignments.filter(a => a.status === "pending").length > 0 ? (
                    myAgentAssignments.filter(a => a.status === "pending").map((assignment, index) => {
                      const pos = index + 1;
                      return (
                        <TableRow key={assignment.visitorId} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell align="center">
                            <Box sx={{ width: 28, height: 28, borderRadius: 1.5, mx: "auto", bgcolor: "#dc262614", color: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem" }}>
                              {pos}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Box sx={{ position: "relative" }}>
                                <Avatar sx={{ width: 34, height: 34, bgcolor: getAvatarColor(assignment.visitorId), fontSize: "0.85rem", fontWeight: 700 }}>
                                  {assignment.visitorName.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", bgcolor: "#eab308", border: "2px solid #fff" }} />
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900", lineHeight: 1.2 }}>{assignment.visitorName}</Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                                  Assigned to{" "}
                                  <Typography component="span" variant="caption" sx={{ fontWeight: 700, color: "#0e7490", fontSize: "0.7rem" }}>
                                    {assignment.agentName || "You"}
                                  </Typography>
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }} title={assignment.message}>
                              {assignment.message}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip icon={<Clock size={12} />} label={assignment.timeInQueue || "0m"} size="small"
                              sx={{ bgcolor: "#eab3081a", color: "#7a5d00", fontWeight: 600, height: 24, "& .MuiChip-icon": { color: "#b48600" } }} />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              icon={<Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "warning.main", ml: 1 }} />}
                              label="Pending" size="small"
                              sx={{ bgcolor: "#eab30820", color: "#7a5d00", fontWeight: 600, height: 24, "& .MuiChip-icon": { ml: 1 } }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              onClick={() => setAcceptToConfirm(assignment)}
                              variant="contained"
                              size="small"
                              startIcon={<CheckIcon size={14} />}
                              sx={{
                                bgcolor: "#16a34a", color: "#fff",
                                "&:hover": { bgcolor: "#15803d" },
                                textTransform: "none", fontSize: "0.75rem", fontWeight: 700,
                                px: 2, py: 0.5, borderRadius: 2,
                                boxShadow: "0 2px 8px #16a34a40",
                              }}
                            >
                              Accept
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <EmptyState icon={<Zap size={22} color="#a3a3a3" />} title="No active sessions" subtitle="No chats have been assigned to you yet." />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* ════════════════════ TABLE 1 — WAITING QUEUE ════════════════════ */}
        {(isAgent || queueViewMode === "list") && (
          <Paper elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{
              px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid", borderColor: "grey.200",
              background: "linear-gradient(135deg, #eab30814 0%, #eab30808 100%)",
            }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "#eab30820", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Hourglass size={17} color="#b48600" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "grey.900", lineHeight: 1.2 }}>Waiting Queue</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>Visitors waiting for an agent</Typography>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                {assignMode === "auto" && (
                  <Chip
                    icon={<Bot size={12} />}
                    label="Auto-assigning"
                    size="small"
                    sx={{ bgcolor: "#0891b218", color: "#0e7490", fontWeight: 700, height: 24, "& .MuiChip-icon": { color: "#0891b2" } }}
                  />
                )}
                <Chip label={`${waitingQueue.length} waiting`} size="small"
                  sx={{ bgcolor: "#eab30826", color: "#7a5d00", fontWeight: 700, height: 26 }} />
              </Stack>
            </Box>

            <TableContainer sx={{ overflow: "visible" }}>
              <Table>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell width="7%" align="center">#</TableCell>
                    <TableCell width="20%">Visitor</TableCell>
                    <TableCell width="28%">Message</TableCell>
                    <TableCell width="12%" align="center">Wait Time</TableCell>
                    <TableCell width="10%" align="center">Status</TableCell>
                    {!isAgent && assignMode === "auto" && <TableCell width="14%" align="center">Auto-Assigned To</TableCell>}

                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginate(waitingQueue, queuePage).length > 0 ? (
                    paginate(waitingQueue, queuePage).map((item, index) => {
                      const pos = (queuePage - 1) * itemsPerPage + index + 1;
                      const isFirst = pos === 1;
                      const globalIndex = (queuePage - 1) * itemsPerPage + index;
                      const autoAgent = assignMode === "auto" ? getAutoAssignAgent(globalIndex, maxChatsPerAgent, agents) : null;

                      return (
                        <TableRow key={item.id} hover sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          transition: "background 0.15s",
                          ...(isFirst && {
                            bgcolor: "#0891b20f",
                            borderLeft: "3px solid", borderLeftColor: "primary.main",
                            "& td:first-of-type": { pl: 1.5 },
                            "& td": { py: 2.5 },
                          }),
                        }}>
                          <TableCell align="center">
                            <Box sx={{ mx: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                              <Typography sx={{ fontWeight: 700, fontSize: isFirst ? "1rem" : "0.8rem", color: isFirst ? "primary.main" : "grey.700" }}>
                                {pos}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={isFirst ? 2 : 1.5}>
                              <Avatar sx={{
                                width: isFirst ? 46 : 34, height: isFirst ? 46 : 34, bgcolor: getAvatarColor(item.id), fontSize: isFirst ? "1.1rem" : "0.85rem", fontWeight: 700,
                                ...(isFirst && { boxShadow: "0 0 0 2px #0891b2" }),
                              }}>
                                {item.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Typography variant={isFirst ? "body1" : "body2"} sx={{ fontWeight: isFirst ? 700 : 600, color: "grey.900", lineHeight: 1.2 }}>
                                    {item.name}
                                  </Typography>
                                  {isFirst && (
                                    <Chip label="Next Up" size="small" sx={{
                                      height: 20, fontSize: "0.65rem", fontWeight: 800,
                                      bgcolor: "primary.main", color: "#fff", letterSpacing: "0.03em",
                                      "& .MuiChip-label": { px: 0.75, py: 0 },
                                    }} />
                                  )}
                                </Stack>
                                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: isFirst ? "0.75rem" : "0.7rem" }}>{getQueueDisplayId(item.id)}</Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant={isFirst ? "body1" : "body2"} sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }} title={item.message}>
                              {item.message}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip icon={<Clock size={isFirst ? 14 : 12} />} label={item.timeInQueue || "0m"} size="small"
                              sx={{ bgcolor: "#eab3081a", color: "#7a5d00", fontWeight: 600, height: isFirst ? 28 : 24, ...(isFirst && { fontSize: "0.8rem" }), "& .MuiChip-icon": { color: "#b48600" } }} />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              icon={<Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "warning.main", ml: 1 }} />}
                              label="Waiting" size="small"
                              sx={{ bgcolor: "#eab30820", color: "#7a5d00", fontWeight: 600, height: 24, "& .MuiChip-icon": { ml: 1 } }}
                            />
                          </TableCell>

                          {/* Auto-Assigned-To column */}
                          {!isAgent && assignMode === "auto" && (
                            <TableCell align="center">
                              {autoAgent ? (
                                <Tooltip title={`Will be auto-assigned to ${autoAgent.name}`}>
                                  <Box sx={{
                                    display: "inline-flex", alignItems: "center", gap: 0.75,
                                    px: 1, py: 0.5, borderRadius: 1.5,
                                    bgcolor: "#0891b20d", border: "1px solid #0891b222",
                                  }}>
                                    <Avatar sx={{ width: 20, height: 20, bgcolor: getAvatarColor(autoAgent.id), fontSize: "0.55rem", fontWeight: 700 }}>
                                      {autoAgent.name.charAt(0)}
                                    </Avatar>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#0e7490", fontSize: "0.7rem", whiteSpace: "nowrap" }}>
                                      {autoAgent.name.split(" ")[0]}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              ) : (
                                <Chip label="No agent" size="small"
                                  sx={{ height: 22, fontSize: "0.65rem", bgcolor: "grey.100", color: "grey.500", fontWeight: 600 }} />
                              )}
                            </TableCell>
                          )}

                          {/* Action column */}
                          <TableCell align="center">
                            {isAgent ? (
                              <Chip label="Awaiting assignment" size="small"
                                sx={{ bgcolor: "grey.100", color: "grey.500", fontWeight: 600, height: 24, fontSize: "0.7rem" }} />
                            ) : isFirst ? (
                              assignMode === "manual" ? (
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  <Tooltip title="Start chat with this visitor">
                                    <IconButton onClick={() => setChatToConfirm(item)} size="small"
                                      sx={{ bgcolor: "primary.main", color: "#fff", width: 38, height: 38, "&:hover": { bgcolor: "primary.dark" }, boxShadow: "0 2px 8px #0891b240" }}>
                                      <MessageSquare size={17} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Manually assign to an agent">
                                    <IconButton onClick={() => { setAssignToConfirm(item); setSelectedAgent(""); }} size="small"
                                      sx={{ bgcolor: "#a855f71a", color: "#7c3aed", width: 38, height: 38, border: "1px solid #a855f733", "&:hover": { bgcolor: "#a855f72e" } }}>
                                      <UserPlus size={17} />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              ) : (
                                <Tooltip title={autoAgent ? `Confirm auto-assign to ${autoAgent.name}` : "No eligible agents"}>
                                  <span>
                                    <IconButton
                                      onClick={() => { if (autoAgent) { setSelectedAgent(autoAgent.id); setAssignToConfirm(item); } }}
                                      disabled={!autoAgent}
                                      size="small"
                                      sx={{
                                        bgcolor: autoAgent ? "#0891b218" : "grey.100",
                                        color: autoAgent ? "#0891b2" : "grey.400",
                                        width: 38, height: 38,
                                        "&:hover": { bgcolor: autoAgent ? "#0891b228" : "grey.100" },
                                      }}>
                                      <Bot size={17} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )
                            ) : (
                              <Typography variant="caption" sx={{ color: "grey.400" }}>—</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <EmptyState icon={<Hourglass size={22} color="#a3a3a3" />} title="No visitors waiting" subtitle="The queue is clear — great job!" />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <PaginationBar current={queuePage} total={totalPages(waitingQueue)} onChange={setQueuePage} count={waitingQueue.length} label="waiting" />
          </Paper>
        )}

        {/* ════════════════════ TABLE 2 — CURRENTLY BEING SERVED (admin only) ════════════════════ */}
        {!isAgent && queueViewMode === "list" && <Paper elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{
            px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid", borderColor: "grey.200",
            background: "linear-gradient(135deg, #dc262614 0%, #dc262605 100%)",
          }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "#dc26261a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={17} color="#0891b2" />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "grey.900", lineHeight: 1.2 }}>Currently Being Served</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Active sessions assigned to agents</Typography>
              </Box>
            </Stack>
            <Chip label={`${currentQueue.length} active`} size="small"
              sx={{ bgcolor: "#dc26261a", color: "primary.dark", fontWeight: 700, height: 26 }} />
          </Box>

          <TableContainer sx={{ overflow: "visible" }}>
            <Table>
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell width="8%" align="center">#</TableCell>
                  <TableCell width="22%">Visitor</TableCell>
                  <TableCell width="35%">Message</TableCell>
                  <TableCell width="15%" align="center">Session Time</TableCell>
                  <TableCell width="10%" align="center">Status</TableCell>
                  <TableCell width="10%" align="center">{actionsHeaderLabel}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginate(currentQueue, currentPage).length > 0 ? (
                  paginate(currentQueue, currentPage).map((item, index) => {
                    const pos = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <TableRow key={item.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell align="center">
                          <Box sx={{ mx: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.8rem" }}>
                              {pos}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box sx={{ position: "relative" }}>
                              <Avatar sx={{ width: 34, height: 34, bgcolor: getAvatarColor(item.id), fontSize: "0.85rem", fontWeight: 700 }}>
                                {item.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box sx={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", bgcolor: "#16a34a", border: "2px solid #fff" }} />
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900", lineHeight: 1.2 }}>{item.name}</Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>{getQueueDisplayId(item.id)}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }} title={item.message}>
                            {item.message}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip icon={<Activity size={12} />} label={item.timeInQueue || "0m"} size="small"
                            sx={{ bgcolor: "#16a34a1a", color: "#15803d", fontWeight: 600, height: 24, "& .MuiChip-icon": { color: "#16a34a" } }} />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={<Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main", ml: 1 }} />}
                            label="Active" size="small"
                            sx={{ bgcolor: "#16a34a1f", color: "#15803d", fontWeight: 600, height: 24, "& .MuiChip-icon": { ml: 1 } }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => { if (onStartChat) onStartChat(item); }}
                              sx={actionButtonSx}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setAssignToConfirm(item);
                                setSelectedAgent("");
                              }}
                              sx={primaryButtonSx}
                            >
                              Transfer
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <EmptyState icon={<Zap size={22} color="#a3a3a3" />} title="No active sessions" subtitle="No visitors are being served right now." />
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <PaginationBar current={currentPage} total={totalPages(currentQueue)} onChange={setCurrentPage} count={currentQueue.length} label="active" />
        </Paper>}

        {/* ════════════════════ TABLE 3 — VISITOR DETAILS ════════════════════ */}
        {!isAgent && queueViewMode === "list" && <Paper elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{
            px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid", borderColor: "grey.200",
            background: "linear-gradient(135deg, #1111110a 0%, #11111103 100%)",
          }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "#11111114", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Globe size={17} color="#111111" />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "grey.900", lineHeight: 1.2 }}>Visitor Details</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>IP addresses, geolocation, devices & session info</Typography>
              </Box>
            </Stack>
            <Chip label={`${allFiltered.length} visitors`} size="small"
              sx={{ bgcolor: "grey.100", color: "grey.700", fontWeight: 700, height: 26 }} />
          </Box>

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell>Visitor</TableCell>
                  <TableCell>Visitor ID</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell align="center">{actionsHeaderLabel}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginate(allFiltered, visitorPage).length > 0 ? (
                  paginate(allFiltered, visitorPage).map((item) => {
                    const visitorId = item.visitorId || item.sessionId || item.id;
                    const ip = item.ipAddress || "—";
                    return (
                      <TableRow key={item.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar sx={{ width: 30, height: 30, bgcolor: getAvatarColor(item.id), fontSize: "0.8rem", fontWeight: 700 }}>
                              {item.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900" }}>{item.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={visitorId} size="small"
                            sx={{ bgcolor: "#1111110f", color: "grey.700", fontWeight: 600, fontFamily: "monospace", fontSize: "0.72rem", height: 24 }} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Wifi size={13} color="#737373" />
                            <Typography variant="body2" sx={{ color: "grey.700", fontFamily: "monospace", fontSize: "0.8rem" }}>{ip}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setVisitorDetail(item)}
                            sx={primaryButtonSx}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <EmptyState icon={<Globe size={22} color="#a3a3a3" />} title="No visitor data" subtitle="Visitor details will appear when visitors join the queue." />
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <PaginationBar current={visitorPage} total={totalPages(allFiltered)} onChange={setVisitorPage} count={allFiltered.length} label="visitors" />
        </Paper>}

        {/* ════════════════════ MODAL — Start Chat ════════════════════ */}
        <Dialog open={!!chatToConfirm} onClose={() => setChatToConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
          {/* Header */}
          <Box sx={{
            px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid", borderColor: "grey.200",
            background: "linear-gradient(135deg, #0891b214 0%, #0891b205 100%)",
          }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#0891b21f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageSquare size={18} color="#0891b2" />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "grey.900", lineHeight: 1.2 }}>Start Chat</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Confirm before starting the live session</Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setChatToConfirm(null)} size="small" sx={{ color: "grey.500" }}>
              <X size={18} />
            </IconButton>
          </Box>

          <DialogContent sx={{ pt: 3, pb: 2 }}>
            {/* Visitor card */}
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "grey.200", mb: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: getAvatarColor(chatToConfirm?.id ?? ""), fontSize: "1rem", fontWeight: 700 }}>
                  {chatToConfirm?.name?.charAt(0) ?? "?"}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "grey.900" }}>{chatToConfirm?.name}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {chatToConfirm?.message}
                  </Typography>
                </Box>
                <Chip icon={<Clock size={10} />} label={chatToConfirm?.timeInQueue || "0m"} size="small"
                  sx={{ bgcolor: "#eab3081a", color: "#7a5d00", fontWeight: 600, height: 22, fontSize: "0.7rem", "& .MuiChip-icon": { color: "#b48600" } }} />
              </Stack>
            </Box>

            {/* Notice */}
            <Box sx={{ p: 1.5, bgcolor: "#0891b20d", borderRadius: 2, border: "1px solid", borderColor: "#0891b230", display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#0891b2", flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: "#0e7490" }}>
                This visitor will be{" "}
                <Typography component="span" variant="caption" sx={{ fontWeight: 700, color: "#0e7490" }}>removed from the waiting queue</Typography>
                {" "}and the session will begin immediately.
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button onClick={() => setChatToConfirm(null)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
            <Button
              onClick={() => {
                if (onStartChat && chatToConfirm) onStartChat(chatToConfirm);
                setChatToConfirm(null);
              }}
              variant="contained" startIcon={<MessageSquare size={16} />}
              sx={{ bgcolor: "#0891b2", "&:hover": { bgcolor: "#0e7490" }, fontWeight: 700, boxShadow: "0 2px 8px #0891b240" }}>
              Start Chat
            </Button>
          </DialogActions>
        </Dialog>

        {/* ════════════════════ MODAL — Accept Assignment ════════════════════ */}
        <Dialog open={!!acceptToConfirm} onClose={() => setAcceptToConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
          {/* Header */}
          <Box sx={{
            px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid", borderColor: "grey.200",
            background: "linear-gradient(135deg, #16a34a14 0%, #16a34a05 100%)",
          }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#16a34a1f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckIcon size={18} color="#16a34a" />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "grey.900", lineHeight: 1.2 }}>Accept Chat</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Confirm before starting the live session</Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setAcceptToConfirm(null)} size="small" sx={{ color: "grey.500" }}>
              <X size={18} />
            </IconButton>
          </Box>

          <DialogContent sx={{ pt: 3, pb: 2 }}>
            {/* Visitor card */}
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "grey.200", mb: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: "#0891b2", fontSize: "1rem", fontWeight: 700 }}>
                  {acceptToConfirm?.visitorName?.charAt(0) ?? "?"}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "grey.900" }}>{acceptToConfirm?.visitorName}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {acceptToConfirm?.message}
                  </Typography>
                </Box>
                <Chip icon={<Clock size={10} />} label={acceptToConfirm?.timeInQueue || "0m"} size="small"
                  sx={{ bgcolor: "#eab3081a", color: "#7a5d00", fontWeight: 600, height: 22, fontSize: "0.7rem", "& .MuiChip-icon": { color: "#b48600" } }} />
              </Stack>
            </Box>

            {/* Status notice */}
            <Box sx={{ p: 1.5, bgcolor: "#eab30814", borderRadius: 2, border: "1px solid", borderColor: "#eab30840", display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#eab308", flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: "#7a5d00" }}>
                Your status will automatically change to{" "}
                <Typography component="span" variant="caption" sx={{ fontWeight: 700, color: "#7a5d00" }}>Busy</Typography>
                {" "}when you start this chat.
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button onClick={() => setAcceptToConfirm(null)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<MessageSquare size={16} />}
              sx={{ bgcolor: "#16a34a", "&:hover": { bgcolor: "#15803d" }, fontWeight: 700, boxShadow: "0 2px 8px #16a34a40" }}
              onClick={async () => {
                const assignment = acceptToConfirm;
                setAcceptToConfirm(null);

                if (onAcceptAssignment) {
                  try {
                    await onAcceptAssignment(assignment);
                  } catch (error) {
                    toast.error("Failed to accept assigned chat.");
                    return;
                  }
                }

                // Navigate to chat session
                if (onStartChat) {
                  onStartChat({
                    id: assignment.visitorId,
                    conversationId: assignment.conversationId,
                    name: assignment.visitorName,
                    message: assignment.message,
                    timeInQueue: assignment.timeInQueue,
                    status: "Assigned",
                  });
                }
              }}
            >
              Start Live Chat
            </Button>
          </DialogActions>
        </Dialog>

        {/* ════════════════════ MODAL — Assign Agent ════════════════════ */}
        <Dialog open={!!assignToConfirm} onClose={() => { setAssignToConfirm(null); setSelectedAgent(""); }}
          maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
          {/* Custom header */}
          <Box sx={{
            px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid", borderColor: "grey.200",
            background: assignMode === "auto"
              ? "linear-gradient(135deg, #0891b214 0%, #0891b205 100%)"
              : "linear-gradient(135deg, #a855f714 0%, #a855f705 100%)",
          }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{
                width: 36, height: 36, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center",
                bgcolor: assignMode === "auto" ? "#0891b21f" : "#a855f71f",
              }}>
                {assignMode === "auto" ? <Bot size={18} color="#0891b2" /> : <UserPlus size={18} color="#7c3aed" />}
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "grey.900", lineHeight: 1.2 }}>
                  {assignMode === "auto" ? "Confirm Auto-Assignment" : "Assign Agent"}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {assignMode === "auto"
                    ? "Review and confirm the suggested assignment"
                    : <>Assign <Typography component="span" variant="caption" sx={{ fontWeight: 700, color: "grey.800" }}>{assignToConfirm?.name}</Typography> to an agent</>}
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => { setAssignToConfirm(null); setSelectedAgent(""); }} size="small" sx={{ color: "grey.500" }}>
              <X size={18} />
            </IconButton>
          </Box>

          <DialogContent sx={{ pt: 3, pb: 2 }}>
            {/* Auto-mode: show the suggested agent card */}
            {assignMode === "auto" && selectedAgent && (() => {
              const agent = agents.find(a => a.id === selectedAgent);
              return agent ? (
                <Box sx={{ mb: 2, p: 2, bgcolor: "#0891b20a", borderRadius: 2, border: "1px solid #0891b220" }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ position: "relative" }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: getAvatarColor(agent.id), fontSize: "0.85rem", fontWeight: 700 }}>
                        {agent.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", bgcolor: "#16a34a", border: "2px solid #fff" }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "grey.900" }}>{agent.name}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                        {agent.activeChats} active chat{agent.activeChats !== 1 ? "s" : ""} · Auto-suggested
                      </Typography>
                    </Box>
                    <Chip label="Auto" size="small" icon={<Bot size={11} />}
                      sx={{ height: 20, fontSize: "0.62rem", fontWeight: 700, bgcolor: "#0891b218", color: "#0e7490", "& .MuiChip-icon": { color: "#0891b2" }, "& .MuiChip-label": { px: 0.75 } }} />
                  </Stack>
                </Box>
              ) : null;
            })()}

            {/* Agent selector (override in auto mode, primary in manual) */}
            <FormControl fullWidth size="small">
              <InputLabel id="assign-agent-label" sx={{ fontSize: "0.85rem" }}>
                {assignMode === "auto" ? "Override Agent (optional)" : "Select Agent"}
              </InputLabel>
              <Select
                labelId="assign-agent-label"
                value={selectedAgent}
                label={assignMode === "auto" ? "Override Agent (optional)" : "Select Agent"}
                onChange={(e) => setSelectedAgent(e.target.value)}
                sx={{ borderRadius: 2, fontSize: "0.85rem" }}
                renderValue={(val) => agents.find(a => a.id === val)?.name ?? ""}
              >
                {agents.map((agent) => (
                  <MenuItem key={agent.id} value={agent.id} sx={{ py: 1.25 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: "100%" }}>
                      <Box sx={{ position: "relative" }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: getAvatarColor(agent.id), fontSize: "0.75rem", fontWeight: 700 }}>
                          {agent.name.charAt(0)}
                        </Avatar>
                        <Box sx={{
                          position: "absolute", bottom: -1, right: -1, width: 9, height: 9, borderRadius: "50%",
                          bgcolor: agent.status === "online" ? "#16a34a" : "#d97706", border: "2px solid #fff",
                        }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900", lineHeight: 1.2 }}>{agent.name}</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
                          {agent.status === "online" ? "Online" : "Away"} · {agent.activeChats} active chat{agent.activeChats !== 1 ? "s" : ""}
                        </Typography>
                      </Box>
                      {agent.activeChats === 0 && (
                        <Chip label="Free" size="small"
                          sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700, bgcolor: "#16a34a1a", color: "#15803d", "& .MuiChip-label": { px: 0.75 } }} />
                      )}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Manual mode confirmation note */}
            {selectedAgent && assignMode === "manual" && (() => {
              const agent = agents.find(a => a.id === selectedAgent);
              return agent ? (
                <Box sx={{ mt: 2, p: 2, bgcolor: "#a855f70a", borderRadius: 2, border: "1px solid #a855f71f" }}>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                    <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: "grey.900", fontSize: "0.82rem" }}>{assignToConfirm?.name}</Typography>
                    {" "}will be assigned to{" "}
                    <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: "#7c3aed", fontSize: "0.82rem" }}>{agent.name}</Typography>
                    {" "}and removed from the waiting queue.
                  </Typography>
                </Box>
              ) : null;
            })()}
          </DialogContent>

          <DialogActions sx={{ p: 2, bgcolor: "grey.50", borderTop: "1px solid", borderColor: "grey.200" }}>
            <Button onClick={() => { setAssignToConfirm(null); setSelectedAgent(""); }} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
            <Button
              onClick={async () => {
                if (isProcessingAssignment) {
                  return;
                }

                if (assignToConfirm && selectedAgent) {
                  const agent = agents.find(a => a.id === selectedAgent);
                  if (agent) {
                    setIsProcessingAssignment(true);

                    try {
                      if (onAssignConversation) {
                        await onAssignConversation(assignToConfirm, selectedAgent);
                      }

                      toast.success(`${agent.name} has been assigned to ${assignToConfirm.name}`);
                    } catch (error) {
                      toast.error("Failed to assign conversation.");
                    } finally {
                      setIsProcessingAssignment(false);
                    }
                  }
                }
                setAssignToConfirm(null);
                setSelectedAgent("");
              }}
              variant="contained"
              disabled={!selectedAgent || isProcessingAssignment}
              startIcon={assignMode === "auto" ? <Bot size={16} color="#ffffff" /> : <UserPlus size={16} color="#ffffff" />}
              style={{ color: "#ffffff", backgroundColor: selectedAgent ? (assignMode === "auto" ? "#0891b2" : "#7c3aed") : undefined }}
              sx={{
                fontWeight: 600, color: "#ffffff",
                "&:hover": { bgcolor: assignMode === "auto" ? "#0e7490" : "#6d28d9" },
                "&.Mui-disabled": { bgcolor: "grey.200", color: "grey.500" },
              }}
            >
              {assignMode === "auto" ? "Confirm Assignment" : "Assign Agent"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ════════════════════ MODAL — Visitor Detail ════════════════════ */}
        {(() => {
          const detail = {
            visitorId: visitorDetail?.visitorId || visitorDetail?.sessionId || visitorDetail?.id || "",
            ip: visitorDetail?.ipAddress || "—",
            location: visitorDetail?.location || "Unknown",
            country: visitorDetail?.country || "—",
            flag: "🌐",
            browser: visitorDetail?.browser || "—",
            device: visitorDetail?.device || "—",
            deviceType: visitorDetail?.deviceType || "desktop",
            os: visitorDetail?.os || "—",
            referrer: visitorDetail?.referrer || "—",
            currentPage: visitorDetail?.currentPage || "—",
            visits: visitorDetail?.visits || 1,
            language: visitorDetail?.language || "en-US",
          };
          return (
            <React.Fragment>
              <Dialog open={!!visitorDetail} onClose={() => setVisitorDetail(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
                <Box sx={{
                  px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderBottom: "1px solid", borderColor: "grey.200",
                  background: "linear-gradient(135deg, #0891b214 0%, #0891b205 100%)",
                }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    {visitorDetail && (
                      <Avatar sx={{ width: 40, height: 40, bgcolor: getAvatarColor(visitorDetail.id), fontSize: "1rem", fontWeight: 700 }}>
                        {visitorDetail.name.charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "grey.900", lineHeight: 1.2 }}>{visitorDetail?.name}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "monospace" }}>{detail.visitorId}</Typography>
                    </Box>
                  </Stack>
                  <IconButton onClick={() => setVisitorDetail(null)} size="small" sx={{ color: "grey.500" }}>
                    <X size={18} />
                  </IconButton>
                </Box>
                <DialogContent sx={{ p: 0 }}>
                  <Stack divider={<Divider />}>
                    {[
                      {
                        icon: <MapPin size={15} />, label: "Geo Location", value: (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography sx={{ fontSize: "1rem", lineHeight: 1 }}>{detail.flag}</Typography>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: "grey.900", lineHeight: 1.2 }}>{detail.location}</Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>{detail.country}</Typography>
                            </Box>
                          </Stack>
                        )
                      },
                      {
                        icon: getDeviceIcon(detail.deviceType as string), label: "Device", value: (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: "grey.900", lineHeight: 1.2 }}>{detail.device}</Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>{detail.os}</Typography>
                          </Box>
                        )
                      },
                      { icon: <Globe size={15} />, label: "Browser", value: detail.browser },
                      {
                        icon: <Eye size={15} />, label: "Current Page", value: (
                          <Chip label={detail.currentPage} size="small" sx={{
                            bgcolor: "#0891b214", color: "primary.dark",
                            fontWeight: 500, fontFamily: "monospace", fontSize: "0.72rem", height: 24,
                          }} />
                        )
                      },
                      {
                        icon: <Activity size={15} />, label: "Total Visits", value: (
                          <Box sx={{
                            width: 28, height: 28, borderRadius: "50%",
                            bgcolor: detail.visits > 5 ? "#16a34a1a" : "grey.100",
                            color: detail.visits > 5 ? "#15803d" : "grey.700",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: "0.8rem",
                          }}>
                            {detail.visits}
                          </Box>
                        )
                      },
                      { icon: <MessageSquare size={15} />, label: "Language", value: detail.language },
                      { icon: <Wifi size={15} />, label: "Referrer", value: detail.referrer },
                    ].map((row, i) => (
                      <Stack key={i} direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 1.75 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ color: "grey.500" }}>
                          {row.icon}
                          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>{row.label}</Typography>
                        </Stack>
                        <Box sx={{ textAlign: "right" }}>
                          {typeof row.value === "string" ? (
                            <Typography variant="body2" sx={{ fontWeight: 500, color: "grey.900", fontSize: "0.82rem" }}>{row.value}</Typography>
                          ) : row.value}
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: "grey.50", borderTop: "1px solid", borderColor: "grey.200" }}>
                  <Button onClick={() => setVisitorDetail(null)} color="inherit" sx={{ fontWeight: 600 }}>Close</Button>
                  <Button
                    onClick={() => { if (visitorDetail) setChatToConfirm(visitorDetail); setVisitorDetail(null); }}
                    variant="contained" color="primary" startIcon={<MessageSquare size={16} />} sx={{ fontWeight: 600 }}>
                    Start Chat
                  </Button>
                </DialogActions>
              </Dialog>
            </React.Fragment>
          );
        })()}

      </Box>
    </>
  );
}

export default QueueView;


