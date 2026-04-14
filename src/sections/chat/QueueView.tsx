import { useMemo, useState, type CSSProperties } from "react";
import { Eye, Hourglass, MessageSquare, Search, Zap } from "lucide-react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";
import type { ReusableTableColumn } from "../../components/ReusableTable";
import PageTitle from "../../components/common/PageTitle";
import TitleTag from "../../components/TitleTag";
import useNowTick from "../../hooks/useNowTick";
import type { QueueActorRole, QueueAgentOption, QueueVisitorRow } from "../../models/QueueViewModel";
import { toast } from "sonner";
import QueueAssignDialog from "./components/QueueAssignDialog";
import QueueRealtimeTable from "./components/QueueRealtimeTable";
import VisitorDetailsDialog from "./components/VisitorDetailsDialog";
import { formatElapsedTime, getQueueDisplayId } from "../../utils/liveChatQueueTime";

interface QueueViewProps {
  queue: QueueVisitorRow[];
  actorRole?: QueueActorRole;
  actorStatus?: string;
  selfPickEligible?: boolean;
  agents?: QueueAgentOption[];
  onAssignConversation?: (visitor: QueueVisitorRow, agentId: string) => Promise<void>;
  onTakeConversation?: (visitor: QueueVisitorRow) => Promise<void>;
  onSelfPickConversation?: (visitor: QueueVisitorRow) => Promise<void>;
  onStartChat?: (visitor: QueueVisitorRow) => void;
  isAgent?: boolean;
  currentAgentId?: string;
}

const getAvatarColor = (id: string) => {
  const avatarColors = ["#0891b2", "#1F75FE", "#A855F7", "#B48600", "#16a34a", "#FF5A1F"];
  const charCode = id.charCodeAt(id.length - 1) || 0;
  return avatarColors[charCode % avatarColors.length];
};

const QueueView = ({
  queue,
  actorRole,
  actorStatus,
  selfPickEligible = false,
  agents = [],
  onAssignConversation,
  onTakeConversation,
  onSelfPickConversation,
  onStartChat,
  isAgent = false,
  currentAgentId,
}: QueueViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [waitingPage, setWaitingPage] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const [selectedVisitor, setSelectedVisitor] = useState<QueueVisitorRow | null>(null);
  const [assignTargetVisitor, setAssignTargetVisitor] = useState<QueueVisitorRow | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const now = useNowTick();

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

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const matchesSearch = (item: QueueVisitorRow) => {
    if (!normalizedSearch) {
      return true;
    }

    return `${item.name} ${item.message}`.toLowerCase().includes(normalizedSearch);
  };

  const waitingQueue = useMemo(
    () =>
      queue.filter((item) => {
        if (item.status !== "Waiting") {
          return false;
        }

        return matchesSearch(item);
      }),
    [queue, normalizedSearch],
  );

  const currentlyServedQueue = useMemo(
    () =>
      queue.filter((item) => {
        if (item.status !== "Assigned") {
          return false;
        }

        if (isAgent && currentAgentId && String(item.agentId || "") !== String(currentAgentId)) {
          return false;
        }

        return matchesSearch(item);
      }),
    [currentAgentId, isAgent, normalizedSearch, queue],
  );

  const waitingCount = queue.filter((item) => item.status === "Waiting").length;
  const servedCount = queue.filter((item) => {
    if (item.status !== "Assigned") {
      return false;
    }

    if (isAgent && currentAgentId && String(item.agentId || "") !== String(currentAgentId)) {
      return false;
    }

    return true;
  }).length;

  const actionHeaderLabel = <span style={visuallyHidden}>Actions</span>;

  const buildVisitorCell = (row: QueueVisitorRow) => (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Avatar sx={{ width: 30, height: 30, bgcolor: getAvatarColor(row.id), fontSize: "0.78rem", fontWeight: 700 }}>
        {row.name.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: "grey.900", lineHeight: 1.2 }} noWrap>
          {row.name}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
          {getQueueDisplayId(row.id)}
        </Typography>
      </Box>
    </Stack>
  );

  const waitingColumns = useMemo<ReusableTableColumn<QueueVisitorRow>[]>(
    () => [
      {
        id: "visitor",
        label: "Visitor",
        renderCell: (row) => buildVisitorCell(row),
      },
      {
        id: "waitTime",
        label: (
          <>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>Wait</Box>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Wait Time</Box>
          </>
        ),
        align: "center",
        headerAlign: "center",
        renderCell: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#7a5d00" }}>
            {formatElapsedTime(row.queuedAt, now)}
          </Typography>
        ),
      },
      {
        id: "view",
        label: actionHeaderLabel,
        align: "center",
        headerAlign: "center",
        renderCell: (row) => (
          <Tooltip title="View Visitor Details">
            <IconButton
              size="small"
              onClick={() => setSelectedVisitor(row)}
              sx={{
                border: "1px solid",
                borderColor: "grey.300",
                color: "grey.700",
                width: 32,
                height: 32,
                borderRadius: 1.75,
                "&:hover": { bgcolor: "grey.100", borderColor: "grey.400" },
              }}
            >
              <Eye size={15} />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [actionHeaderLabel, now],
  );

  const activeColumns = useMemo<ReusableTableColumn<QueueVisitorRow>[]>(
    () => [
      {
        id: "visitor",
        label: "Visitor",
        renderCell: (row) => buildVisitorCell(row),
      },
      {
        id: "sessionTime",
        label: (
          <>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>Session</Box>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Session Time</Box>
          </>
        ),
        align: "center",
        headerAlign: "center",
        renderCell: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#15803d" }}>
            {formatElapsedTime(row.assignedAt || row.queuedAt, now)}
          </Typography>
        ),
      },
      {
        id: "view",
        label: actionHeaderLabel,
        align: "center",
        headerAlign: "center",
        renderCell: (row) => (
          <Tooltip title="View Visitor Details">
            <IconButton
              size="small"
              onClick={() => setSelectedVisitor(row)}
              sx={{
                border: "1px solid",
                borderColor: "grey.300",
                color: "grey.700",
                width: 32,
                height: 32,
                borderRadius: 1.75,
                "&:hover": { bgcolor: "grey.100", borderColor: "grey.400" },
              }}
            >
              <Eye size={15} />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [actionHeaderLabel, now],
  );

  const handleTakeConversation = async (visitor: QueueVisitorRow) => {
    if (!onTakeConversation) {
      return;
    }

    setIsProcessingAction(true);

    try {
      await onTakeConversation(visitor);
      toast.success("Chat taken successfully.");
      setSelectedVisitor(null);
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Failed to take chat.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleSelfPickConversation = async (visitor: QueueVisitorRow) => {
    if (!onSelfPickConversation) {
      return;
    }

    setIsProcessingAction(true);

    try {
      await onSelfPickConversation(visitor);
      toast.success("Chat picked successfully.");
      setSelectedVisitor(null);
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Failed to self-pick chat.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleAssignConversation = async (agentId: string) => {
    if (!assignTargetVisitor || !onAssignConversation) {
      return;
    }

    setIsProcessingAction(true);

    try {
      await onAssignConversation(assignTargetVisitor, agentId);
      toast.success("Chat assigned successfully.");
      setAssignTargetVisitor(null);
      setSelectedVisitor(null);
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Failed to assign chat.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Queue Management"
        description="Real-time queue tracking with reusable tables and visitor detail drilldown."
        canonical="/portal/queue-management"
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 2.5 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          spacing={{ xs: 1.25, md: 2 }}
        >
          <TitleTag
            title={isAgent ? "Your Queue" : "Customer Queue"}
            subtitle={isAgent ? "Monitor your assigned sessions in real time" : "Monitor live waiting and active sessions"}
            icon={<MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
          />

          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} spacing={1} sx={{ flexWrap: "wrap", width: { xs: "100%", md: "auto" } }}>
            <Stack direction="row" spacing={0.8} sx={{ flexWrap: "wrap", rowGap: 0.8 }}>
              <Chip
                icon={<Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "warning.main", ml: 0.5 }} />}
                label={`${waitingCount} Waiting`}
                size="small"
                sx={{ fontWeight: 600, bgcolor: "#eab30814", color: "#7a5d00", "& .MuiChip-icon": { ml: 0.5 } }}
              />
              <Chip
                label={`${servedCount} Active`}
                size="small"
                sx={{ fontWeight: 600, bgcolor: "#16a34a14", color: "#15803d", "& .MuiChip-icon": { ml: 0.5 } }}
              />
              <Chip
                label={`${queue.length} Total`}
                size="small"
                sx={{ fontWeight: 600, "& .MuiChip-icon": { ml: 0.5 } }}
              />
            </Stack>

            <Box sx={{ position: "relative", width: { xs: "100%", md: 250 } }}>
              <Box
                sx={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "text.secondary",
                  display: "flex",
                }}
              >
                <Search size={16} />
              </Box>
              <InputBase
                placeholder="Search visitors..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setWaitingPage(1);
                  setActivePage(1);
                }}
                sx={{
                  width: "100%",
                  pl: 4.5,
                  pr: 2,
                  py: 0.9,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 2,
                  fontSize: "0.85rem",
                  "&.Mui-focused": { borderColor: "primary.main", boxShadow: "0 0 0 2px #0891b226" },
                }}
                fullWidth
              />
            </Box>
          </Stack>
        </Stack>

        <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="stretch">
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex" }}>
            <Box sx={{ width: "100%" }}>
              <QueueRealtimeTable
                title="Waiting Queue"
                subtitle="Visitors waiting for an agent"
                icon={<Hourglass size={17} color="#b48600" />}
                rows={waitingQueue}
                columns={waitingColumns}
                page={waitingPage}
                onPageChange={setWaitingPage}
                getRowKey={(row) => row.id}
                badgeTone="warning"
                emptyStateTitle="No visitors waiting"
                emptyStateDescription="The queue is clear right now."
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex" }}>
            <Box sx={{ width: "100%" }}>
              <QueueRealtimeTable
                title="Currently Being Served"
                subtitle="Active sessions assigned to agents"
                icon={<Zap size={17} color="#15803d" />}
                rows={currentlyServedQueue}
                columns={activeColumns}
                page={activePage}
                onPageChange={setActivePage}
                getRowKey={(row) => row.id}
                badgeTone="success"
                emptyStateTitle="No active sessions"
                emptyStateDescription="No visitors are being served right now."
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <VisitorDetailsDialog
        open={Boolean(selectedVisitor)}
        visitor={selectedVisitor}
        now={now}
        actorRole={actorRole}
        actorStatus={actorStatus}
        selfPickEligible={selfPickEligible}
        isProcessingAction={isProcessingAction}
        onClose={() => setSelectedVisitor(null)}
        onStartChat={onStartChat}
        onTakeConversation={handleTakeConversation}
        onSelfPickConversation={handleSelfPickConversation}
        onOpenAssignDialog={(visitor) => setAssignTargetVisitor(visitor)}
      />

      <QueueAssignDialog
        open={Boolean(assignTargetVisitor)}
        visitor={assignTargetVisitor}
        agents={agents}
        loading={isProcessingAction}
        onClose={() => setAssignTargetVisitor(null)}
        onAssign={handleAssignConversation}
      />
    </>
  );
};

export default QueueView;
