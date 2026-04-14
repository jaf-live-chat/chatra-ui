import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  UserPlus,
  Circle,
  Eye,
  Link2,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import Agents, { useGetAgents } from "../../services/agentServices";
import useAuth from "../../hooks/useAuth";
import type { AuthAgent, CreateAgentInput } from "../../models/AgentModel";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from '@mui/material/Tooltip'
import ReusableTable, { type ReusableTableColumn } from "../../components/ReusableTable";
import AgentEditDialog, { type AgentEditDialogFormValues } from "./components/AgentEditDialog";
import PageTitle from "../../components/common/PageTitle";
import idLabel from "../../utils/idUtils";
import getAvatarColor from "../../utils/getAvatarColor";
import TitleTag from "../../components/TitleTag";
import { USER_ROLES } from "../../constants/constants";
import { toast } from "sonner";

interface Agent extends AuthAgent {
  id: string;
  name: string;
  email: string;
  status: string;
  autoAssign: boolean;
  chatsHandled: number;
}

function mapAgentForView(agent: AuthAgent): Agent {
  return {
    ...agent,
    id: agent._id,
    name: agent.fullName,
    email: agent.emailAddress,
    status: agent.status === "OFFLINE" ? "Away" : "Online",
    autoAssign: false,
    chatsHandled: 0,
  };
}

function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) {
      return data.message;
    }
  }

  return fallbackMessage;
}

function formatRole(role: string): string {
  if (!role) return "";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const UNLIMITED_AGENT_LIMIT = 999999;

function isUnlimitedAgentLimit(limit?: number | null): boolean {
  return typeof limit !== "number" || !Number.isFinite(limit) || limit >= UNLIMITED_AGENT_LIMIT;
}

function formatAgentCapacity(usedAgents: number, maxAgents?: number | null): string {
  if (isUnlimitedAgentLimit(maxAgents)) {
    return `${usedAgents}/Unlimited Agents`;
  }

  return `${usedAgents}/${maxAgents} Agents`;
}

const ITEMS_PER_PAGE = 5;

const lightChipSx = {
  fontWeight: 600,
  borderRadius: 1,
  border: "none",
  boxShadow: "none",
};

const AgentsManagementView = () => {
  const navigate = useNavigate();
  const { user, tenant } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [isDeletingAgent, setIsDeletingAgent] = useState(false);
  const [editForm, setEditForm] = useState<AgentEditDialogFormValues>({
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
    role: "SUPPORT_AGENT",
  });
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [isAddingAgents, setIsAddingAgents] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [inviteRows, setInviteRows] = useState<Array<{ email: string; name: string; role: string }>>([
    { email: "", name: "", role: "SUPPORT_AGENT" },
  ]);
  const [draftErrors, setDraftErrors] = useState<{ name: string; email: string }>({
    name: "",
    email: "",
  });
  const [inviteCopied, setInviteCopied] = useState(false);

  const showSnackbar = (
    message: string,
    tone: "add" | "edit" | "delete" | "error"
  ) => {
    if (tone === "error") {
      toast.error(message);
      return;
    }

    toast.success(message);
  };

  const {
    data: agentsResponse,
    agents: fetchedAgents,
    pagination,
    isLoading,
    error: agentsError,
    mutate: mutateAgents,
  } = useGetAgents({ page, limit: ITEMS_PER_PAGE, search: searchTerm });

  const agents = useMemo(() => fetchedAgents.map(mapAgentForView), [fetchedAgents]);
  const tenantSubscriptionUsage = agentsResponse?.subscriptionUsage;
  const maxAgentsLimit =
    tenantSubscriptionUsage?.maxAgents ??
    tenant?.subscriptionData?.configuration?.limits?.maxAgents ??
    null;
  const hasAdvancedAnalytics =
    tenantSubscriptionUsage?.hasAdvancedAnalytics ??
    Boolean(tenant?.subscriptionData?.configuration?.limits?.hasAdvancedAnalytics);
  const currentAgentCount =
    tenantSubscriptionUsage?.usedAgents ??
    pagination?.totalRecords ??
    agents.length;
  const isUnlimitedAgentsPlan = isUnlimitedAgentLimit(maxAgentsLimit);
  const remainingAgentSlots = !isUnlimitedAgentsPlan && typeof maxAgentsLimit === "number"
    ? Math.max(maxAgentsLimit - currentAgentCount, 0)
    : null;
  const agentCapacityReached = !isUnlimitedAgentsPlan && typeof maxAgentsLimit === "number"
    ? currentAgentCount >= maxAgentsLimit
    : false;
  const agentCapacityLabel = formatAgentCapacity(currentAgentCount, maxAgentsLimit);
  const agentCapacityProgress = !isUnlimitedAgentsPlan && typeof maxAgentsLimit === "number" && maxAgentsLimit > 0
    ? Math.min((currentAgentCount / maxAgentsLimit) * 100, 100)
    : 100;

  const currentAgentRole = user?.role;
  const isCurrentUserMasterAdmin = currentAgentRole === USER_ROLES.MASTER_ADMIN.value;
  const isCurrentUserAdmin = currentAgentRole === USER_ROLES.ADMIN.value;

  const isPrivilegedRole = (role?: string) =>
    role === USER_ROLES.ADMIN.value || role === USER_ROLES.MASTER_ADMIN.value;

  const canEditAgent = (agent: Agent): boolean => {
    if (!user?._id || user._id === agent.id) return false;
    if (isCurrentUserMasterAdmin) return true;
    if (isCurrentUserAdmin) return !isPrivilegedRole(agent.role);
    return false;
  };

  const canDeleteAgent = (agent: Agent): boolean => {
    if (!user?._id || user._id === agent.id) return false;
    if (isCurrentUserMasterAdmin) return true;
    if (isCurrentUserAdmin) return !isPrivilegedRole(agent.role);
    return false;
  };

  const getEditRestrictionMessage = (agent: Agent): string => {
    if (isOwnAccount(agent.id)) return "You cannot update your own account from here.";
    if (isCurrentUserMasterAdmin) return "Edit agent";
    if (isCurrentUserAdmin && isPrivilegedRole(agent.role)) {
      return "Only Master Admin can update Admin or Master Admin accounts.";
    }
    return "You do not have permission to update this account.";
  };

  const getDeleteRestrictionMessage = (agent: Agent): string => {
    if (isOwnAccount(agent.id)) return "You cannot delete your own account.";
    if (isCurrentUserMasterAdmin) return "Remove agent";
    if (isCurrentUserAdmin && isPrivilegedRole(agent.role)) {
      return "Only Master Admin can delete Admin or Master Admin accounts.";
    }
    return "Delete agent";
  };

  useEffect(() => {
    if (agentsError) {
      showSnackbar(getApiErrorMessage(agentsError, "Failed to load agents"), "error");
    }
  }, [agentsError]);

  const totalRecords = pagination?.totalRecords || 0;

  const actionButtonSx = {
    textTransform: "none" as const,
    borderRadius: 9999,
    px: 1.6,
    borderColor: "divider",
    color: "text.primary",
    fontWeight: 700,
    height: 34,
    minWidth: 76,
    backgroundColor: "background.paper",
    "&:hover": { bgcolor: "action.hover", borderColor: "divider" },
  };

  const handleRemoveAgent = async (agent: Agent) => {
    if (!canDeleteAgent(agent)) {
      showSnackbar(getDeleteRestrictionMessage(agent), "error");
      return;
    }

    try {
      setIsDeletingAgent(true);
      await Agents.deleteAgent(agent.id);
      if (agents.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1));
      }
      await mutateAgents();
      showSnackbar("Agent deleted successfully", "delete");
      setAgentToDelete(null);
    } catch (err) {
      showSnackbar(getApiErrorMessage(err, "Failed to delete agent"), "error");
      console.error(err);
    } finally {
      setIsDeletingAgent(false);
    }
  };

  const handleViewAgent = (agentId: string) => {
    navigate(`/portal/agents/${agentId}`);
  };

  const isOwnAccount = (agentId: string) => Boolean(user?._id && user._id === agentId);

  const handleEditOpen = (agent: Agent) => {
    if (!canEditAgent(agent)) {
      showSnackbar(getEditRestrictionMessage(agent), "error");
      return;
    }

    setEditAgent(agent);
    setEditForm({
      fullName: agent.name || agent.fullName || "",
      emailAddress: agent.email || agent.emailAddress || "",
      phoneNumber: agent.phoneNumber || "",
      role: agent.role || "SUPPORT_AGENT",
    });
  };

  const handleEditSave = async () => {
    if (!editAgent) return;

    if (!canEditAgent(editAgent)) {
      showSnackbar(getEditRestrictionMessage(editAgent), "error");
      return;
    }

    if (isCurrentUserAdmin && editForm.role !== USER_ROLES.SUPPORT_AGENT.value) {
      showSnackbar("Only Master Admin can assign Admin or Master Admin roles.", "error");
      return;
    }

    try {
      const agentId = editAgent.id || editAgent._id;
      if (!agentId) return;
      const response = await Agents.updateAgent(agentId, {
        fullName: editForm.fullName,
        emailAddress: editForm.emailAddress,
        phoneNumber: editForm.phoneNumber.trim() || null,
        role: editForm.role,
      });
      if (!response?.agent) {
        throw new Error("Agent update response is missing agent data");
      }
      await mutateAgents();
      setEditAgent(null);
      showSnackbar("Agent updated successfully", "edit");
    } catch (err) {
      showSnackbar(getApiErrorMessage(err, "Failed to update agent"), "error");
      console.error(err);
    }
  };

  const handleEditClose = () => setEditAgent(null);

  const handleAddOpen = () => {
    if (agentCapacityReached) {
      showSnackbar("Max agents capacity reached for this plan.", "error");
      return;
    }

    setInviteRows([]);
    setDraftName("");
    setDraftEmail("");
    setDraftErrors({ name: "", email: "" });
    setInviteCopied(false);
    setAddOpen(true);
  };
  const handleAddClose = () => setAddOpen(false);

  const handleStageAgent = () => {
    const nextErrors = { name: "", email: "" };

    if (agentCapacityReached) {
      showSnackbar("Max agents capacity reached for this plan.", "error");
      return;
    }

    if (remainingAgentSlots !== null && inviteRows.length >= remainingAgentSlots) {
      showSnackbar("Max agents capacity reached for this plan.", "error");
      return;
    }

    if (!draftName.trim()) nextErrors.name = "Full name is required.";
    if (!draftEmail.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draftEmail)) {
      nextErrors.email = "Enter a valid email.";
    } else if (agents.some((a) => a.email?.toLowerCase() === draftEmail.toLowerCase())) {
      nextErrors.email = "Already exists.";
    } else if (inviteRows.some((a) => a.email.toLowerCase() === draftEmail.toLowerCase())) {
      nextErrors.email = "Already staged.";
    }

    setDraftErrors(nextErrors);
    if (nextErrors.name || nextErrors.email) return;

    setInviteRows((prev) => [
      ...prev,
      { name: draftName.trim(), email: draftEmail.trim(), role: "SUPPORT_AGENT" },
    ]);
    setDraftName("");
    setDraftEmail("");
    setDraftErrors({ name: "", email: "" });
  };

  const handleAddSave = async () => {
    if (inviteRows.length === 0) {
      showSnackbar("Stage at least one agent before submitting.", "error");
      return;
    }

    if (!isUnlimitedAgentsPlan && typeof maxAgentsLimit === "number") {
      if (currentAgentCount + inviteRows.length > maxAgentsLimit) {
        showSnackbar("Max agents capacity reached for this plan.", "error");
        return;
      }
    }

    try {
      setIsAddingAgents(true);
      const newAgents: CreateAgentInput[] = inviteRows.map((row) => ({
        fullName: row.name,
        emailAddress: row.email.trim(),
        password: Math.random().toString(36).slice(-12),
        role: row.role,
      }));

      const response = await Agents.createAgents({ agents: newAgents });
      const newAgentsList = response.agents.map(mapAgentForView);
      await mutateAgents();
      setAddOpen(false);
      showSnackbar(`${newAgentsList.length} agent(s) added successfully`, "add");
    } catch (err) {
      showSnackbar(getApiErrorMessage(err, "Failed to create agents"), "error");
      console.error(err);
    } finally {
      setIsAddingAgents(false);
    }
  };
  const handleRemoveRow = (index: number) => {
    setInviteRows((prev) => prev.filter((_, i) => i !== index));
  };
  const handleUpdateRow = (index: number, field: "role", value: string) => {
    setInviteRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };
  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText("https://jafchatra.com/invite/join-team").then(() => {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    });
  };

  const agentColumns = useMemo<ReusableTableColumn<Agent>[]>(
    () => [
      {
        id: "index",
        label: "#",
        align: "center",
        headerAlign: "center",
        renderCell: (_agent, index) => (
          <Box
            sx={{
              color: "grey.700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.8rem",
            }}
          >
            {index + 1}
          </Box>
        ),
      },
      {
        id: "name",
        label: "Agent",
        sortable: true,
        sortAccessor: (agent) => agent.name,
        renderCell: (agent) => (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: getAvatarColor(),
                fontSize: "0.875rem",
                fontWeight: 700,
              }}
              src={agent.profilePicture || ''}
            >
              {agent.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900", lineHeight: 1.2 }}>
                {agent.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                {idLabel(agent.id, "USER")}
              </Typography>
            </Box>
          </Stack>
        ),
      },

      {
        id: "email",
        label: "Email",
        sortable: true,
        sortAccessor: (agent) => agent.email,
        renderCell: (agent) => (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 220,
            }}
            title={agent.email}
          >
            {agent.email}
          </Typography>
        ),
      },
      {
        id: "role",
        label: "Role",
        align: "center",
        headerAlign: "center",
        sortable: true,
        sortAccessor: (agent) => formatRole(agent.role),
        renderCell: (agent) => (
          <Chip
            label={formatRole(agent.role)}
            size="small"
            sx={{
              ...lightChipSx,
              bgcolor: agent.role === "SUPPORT_AGENT" ? "#e0f2fe" : "#ffedd5",
              color: agent.role === "SUPPORT_AGENT" ? "#0e7490" : "#d97706",
              height: 24,
            }}
          />
        ),
      },
      {
        id: "status",
        label: "Status",
        align: "center",
        headerAlign: "center",
        sortable: true,
        sortAccessor: (agent) => agent.status,
        renderCell: (agent) => (
          <Chip
            icon={<Circle size={8} className="fill-current" />}
            label={agent.status}
            size="small"
            sx={{
              ...lightChipSx,
              bgcolor: agent.status === "Online" ? "#dcfce7" : "#f1f5f9",
              color: agent.status === "Online" ? "success.dark" : "grey.500",
              height: 24,
              "& .MuiChip-icon": { ml: 1, color: "inherit" },
            }}
          />
        ),
      },
      {
        id: "chats",
        label: "Chats",
        align: "center",
        headerAlign: "center",
        sortable: true,
        sortAccessor: (agent) => agent.chatsHandled,
        renderCell: (agent) => (
          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>
            {agent.chatsHandled}
          </Typography>
        ),
      },
      {
        id: "actions",
        label: "",
        align: "right",
        headerAlign: "right",
        renderCell: (agent) => {
          const ownAccount = isOwnAccount(agent.id);
          const editDisabled = !canEditAgent(agent);
          const deleteDisabled = !canDeleteAgent(agent) || isDeletingAgent;

          return (
            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center" rowGap={0.5}>
              <Tooltip title="View agent details" placement="bottom">
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewAgent(agent.id)}
                    sx={actionButtonSx}
                    startIcon={<Eye size={16} />}
                  >
                    View
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title="Edit agent" placement="bottom">
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleEditOpen(agent)}
                    disabled={editDisabled}
                    sx={actionButtonSx}
                    startIcon={<Pencil size={16} />}
                  >
                    Edit
                  </Button>
                </span>
              </Tooltip>

              <Tooltip
                title={getDeleteRestrictionMessage(agent)}
                placement="bottom"
              >
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      if (!canDeleteAgent(agent)) return;
                      setAgentToDelete(agent);
                    }}
                    disabled={deleteDisabled}
                    startIcon={<Trash2 size={16} />}
                    sx={{
                      ...actionButtonSx,
                      color: "#b91c1c",
                      borderColor: "#fecdd3",
                      backgroundColor: "#fff1f2",
                      "&:hover": {
                        bgcolor: "#ffe4e6",
                        borderColor: "#fca5a5",
                      },
                      opacity: deleteDisabled ? 0.7 : 1,
                    }}
                  >
                    Delete
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [isDeletingAgent, user?._id, user?.role],
  );

  return (
    <React.Fragment>
      <PageTitle
        title="Agents Management"
        description="Manage your support team, their statuses, and performance."
        canonical="/portal/agents"
      />


      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* ── Page header ── */}
        <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "flex-end" }} justifyContent="space-between" spacing={2}>
          <TitleTag
            title="Agents Management"
            subtitle="Manage your support team, their statuses, and performance."
            icon={<Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {agentCapacityReached ? (
              <Tooltip title="Max agents capacity reached for this plan" placement="bottom">
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<UserPlus size={18} />}
                    onClick={handleAddOpen}
                    disabled={isLoading || agentCapacityReached}
                    sx={{ fontWeight: 600, px: 3, flexShrink: 0, borderRadius: 1 }}
                  >
                    Add Agent
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<UserPlus size={18} />}
                onClick={handleAddOpen}
                disabled={isLoading}
                sx={{ fontWeight: 600, px: 3, flexShrink: 0, borderRadius: 1 }}
              >
                Add Agent
              </Button>
            )}
          </Stack>
        </Stack>

        {/* ── Stat cards ── */}
        <Grid container spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: "flex" }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.200",
                boxShadow: "0 1px 2px #00000012",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                minHeight: { xs: 136, sm: 144, md: 152 },
                height: "100%",
                width: "100%",
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.75 }}>
                  Agent Capacity
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      color: "grey.900",
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {currentAgentCount}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: "text.secondary",
                      whiteSpace: "nowrap",
                    }}
                  >
                    /{isUnlimitedAgentsPlan ? "Unlimited" : maxAgentsLimit}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ mt: 0.25, color: "text.secondary", fontWeight: 600 }}>
                  {isUnlimitedAgentsPlan ? "Agents on an unlimited plan" : `${remainingAgentSlots ?? 0} slot${remainingAgentSlots === 1 ? "" : "s"} remaining`}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={agentCapacityProgress}
                  sx={{
                    mt: 1.5,
                    height: 8,
                    borderRadius: 999,
                    bgcolor: "grey.100",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      bgcolor: agentCapacityReached ? "#dc2626" : "#0891b2",
                    },
                  }}
                />
              </Box>
              <Avatar sx={{ bgcolor: "#cffafe", color: "#0f766e", width: 48, height: 48 }}>
                <Users size={24} />
              </Avatar>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: "flex" }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.200",
                boxShadow: "0 1px 2px #00000012",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: { xs: 136, sm: 144, md: 152 },
                height: "100%",
                width: "100%",
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>
                  Online Agents
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "grey.900" }}>
                  {agents.filter((a) => a.status === "Online").length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "#dcfce7", color: "#4b5563", width: 48, height: 48 }}>
                <UserCheck size={24} />
              </Avatar>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: "flex" }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.200",
                boxShadow: "0 1px 2px #00000012",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: { xs: 136, sm: 144, md: 152 },
                height: "100%",
                width: "100%",
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>
                  Chats Handled Today
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "grey.900" }}>
                  {agents.reduce((sum, a) => sum + a.chatsHandled, 0)}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "#dbeafe", color: "#2563eb", width: 48, height: 48 }}>
                <MessageSquare size={24} />
              </Avatar>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: "flex" }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.200",
                boxShadow: "0 1px 2px #00000012",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                minHeight: { xs: 136, sm: 144, md: 152 },
                height: "100%",
                width: "100%",
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>
                  Advanced Analytics
                </Typography>
                <Chip
                  label={hasAdvancedAnalytics ? "Enabled" : "Disabled"}
                  size="small"
                  color={hasAdvancedAnalytics ? "success" : "default"}
                  sx={{
                    ...lightChipSx,
                    bgcolor: hasAdvancedAnalytics ? "#dcfce7" : "#e2e8f0",
                    color: hasAdvancedAnalytics ? "#166534" : "#475569",
                    height: 28,
                  }}
                />
              </Box>
              <Avatar sx={{ bgcolor: hasAdvancedAnalytics ? "#dcfce7" : "#e2e8f0", color: hasAdvancedAnalytics ? "#166534" : "#475569", width: 48, height: 48 }}>
                <Circle size={18} className="fill-current" />
              </Avatar>
            </Paper>
          </Grid>
        </Grid>

        <ReusableTable
          title="All Agents"
          subtitle="Support agents and administrators"
          rows={agents}
          columns={agentColumns}
          getRowKey={(agent) => agent.id}
          headerIcon={<Users size={17} />}
          headerBadges={
            <Chip
              icon={<Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "success.main", ml: 0.5 }} />}
              label={`${agents.filter((a) => a.status === "Online").length} online`}
              size="small"
              sx={{
                ...lightChipSx,
                bgcolor: "#dcfce7",
                color: "#15803d",
                height: 30,
                px: 0.6,
                "& .MuiChip-label": { px: 0.9 },
                "& .MuiChip-icon": { ml: 0.5 },
              }}
            />
          }
          loading={isLoading}
          loadingLabel="Loading agents..."
          emptyStateTitle="No agents found"
          emptyStateDescription="Adjust your search or add a new agent."
          search={{
            placeholder: "Search agents...",
            value: searchTerm,
            onChange: setSearchTerm,
          }}
          pagination={{
            rowsPerPage: ITEMS_PER_PAGE,
            page,
            onPageChange: setPage,
            totalRows: totalRecords,
          }}
          totalLabel="agents"
        />

        <AgentEditDialog
          open={!!editAgent}
          onClose={handleEditClose}
          onSave={handleEditSave}
          formValues={editForm}
          onChange={setEditForm}
          maxWidth="xs"
        />

        {/* ── Add Agent Dialog ── */}
        <Dialog open={addOpen} onClose={handleAddClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1 } }}>
          <DialogTitle sx={{ p: 0 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ px: 3, pt: 3, pb: 1 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "grey.900", lineHeight: 1.2 }}>
                  Add New Agents
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.6, color: "text.secondary", fontWeight: 500 }}>
                  Fill in the details below to stage new team members.
                </Typography>
              </Box>
              <IconButton onClick={handleAddClose} sx={{ color: "grey.400" }}>
                <X size={22} />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "8px !important", pb: "10px !important" }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "flex-start" }}>
              <TextField
                value={draftName}
                onChange={(e) => {
                  setDraftName(e.target.value);
                  if (draftErrors.name) setDraftErrors((prev) => ({ ...prev, name: "" }));
                }}
                error={Boolean(draftErrors.name)}
                helperText={draftErrors.name}
                fullWidth
                placeholder="Full Name"
                size="small"
                InputProps={{
                  startAdornment: <User size={16} color="#94a3b8" style={{ marginRight: 8 }} />,
                  sx: {
                    height: 54,
                    borderRadius: 1,
                  },
                }}
              />
              <TextField
                value={draftEmail}
                onChange={(e) => {
                  setDraftEmail(e.target.value);
                  if (draftErrors.email) setDraftErrors((prev) => ({ ...prev, email: "" }));
                }}
                error={Boolean(draftErrors.email)}
                helperText={draftErrors.email}
                fullWidth
                placeholder="Email Address"
                size="small"
                InputProps={{
                  startAdornment: <Mail size={16} color="#94a3b8" style={{ marginRight: 8 }} />,
                  sx: {
                    height: 54,
                    borderRadius: 1,
                  },
                }}
              />
              {(remainingAgentSlots !== null && inviteRows.length >= remainingAgentSlots) ? (
                <Tooltip title="Max agents capacity reached for this plan" placement="bottom">
                  <span>
                    <Button
                      onClick={handleStageAgent}
                      variant="contained"
                      disableElevation
                      startIcon={<Plus size={16} />}
                      disabled
                      sx={{
                        minWidth: 112,
                        height: 54,
                        borderRadius: 1,
                        bgcolor: "#cbd5e1",
                        color: "#fff",
                        "&:hover": { bgcolor: "#94a3b8" },
                      }}
                    >
                      Add
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  onClick={handleStageAgent}
                  variant="contained"
                  disableElevation
                  startIcon={<Plus size={16} />}
                  sx={{
                    minWidth: 112,
                    height: 54,
                    borderRadius: 1,
                    bgcolor: "#cbd5e1",
                    color: "#fff",
                    "&:hover": { bgcolor: "#94a3b8" },
                  }}
                >
                  Add
                </Button>
              )}
            </Stack>

            <Alert
              severity="info"
              sx={{
                borderRadius: 1,
                "& .MuiAlert-message": { fontWeight: 600 },
              }}
            >
              Passwords are auto-generated for new agents and shared with them securely.
            </Alert>

            {!isUnlimitedAgentsPlan && typeof maxAgentsLimit === "number" && (
              <Alert
                severity={remainingAgentSlots === 0 ? "warning" : "info"}
                sx={{
                  borderRadius: 1,
                  "& .MuiAlert-message": { fontWeight: 600 },
                }}
              >
                {remainingAgentSlots === 0
                  ? "Max agents capacity reached for this plan"
                  : `${remainingAgentSlots} agent slot${remainingAgentSlots === 1 ? "" : "s"} remaining on this plan.`}
              </Alert>
            )}

            <Stack spacing={1.25}>
              {inviteRows.map((row, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "grey.200",
                    borderRadius: 1,
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ bgcolor: "#0891b2", color: "#ffffff", width: 52, height: 52, fontWeight: 800 }}>
                        {(row.name?.trim().charAt(0) || row.email.charAt(0) || "A").toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "grey.900", lineHeight: 1.1 }}>
                          {row.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.45 }}>
                          {row.email}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={0.8}>
                      <FormControl size="small" sx={{ minWidth: 170 }}>
                        <Select
                          value={row.role}
                          onChange={(e) => handleUpdateRow(index, "role", e.target.value)}
                          sx={{ borderRadius: 1, bgcolor: "grey.50", fontWeight: 700 }}
                        >
                          <MenuItem value="ADMIN">Admin</MenuItem>
                          <MenuItem value="SUPPORT_AGENT">Support Agent</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton
                        onClick={() => handleRemoveRow(index)}
                        size="small"
                        sx={{ color: "grey.400", "&:hover": { color: "error.main", bgcolor: "#fee2e2" } }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </DialogContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ m: 2, px: 3, py: 1.5, borderTop: "1px solid", borderColor: "grey.200", bgcolor: "grey.50" }}>

            <Box sx={{ mt: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Link2 size={16} color="#94a3b8" />
                <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 700 }}>
                  Or invite agents via link
                </Typography>
                <Typography variant="body2" sx={{ color: "primary.main", cursor: "pointer", fontWeight: 700 }} onClick={handleCopyInviteLink}>
                  {inviteCopied ? "Copied!" : "Copy"}
                </Typography>
              </Stack>
            </Box>

            <DialogActions sx={{}}>

              <Button onClick={handleAddClose} sx={{ color: "grey.600", fontWeight: 700 }}>Cancel</Button>
              {(!isUnlimitedAgentsPlan && typeof maxAgentsLimit === "number" && currentAgentCount + inviteRows.length > maxAgentsLimit) ? (
                <Tooltip title="Max agents capacity reached for this plan" placement="top">
                  <span>
                    <Button
                      onClick={handleAddSave}
                      variant="contained"
                      color="primary"
                      disabled
                      startIcon={<UserPlus size={16} />}
                      sx={{ px: 3.2, borderRadius: 1, fontWeight: 800 }}
                    >
                      {isAddingAgents ? "Adding..." : `Create ${inviteRows.length} Agents`}
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  onClick={handleAddSave}
                  variant="contained"
                  color="primary"
                  disabled={isAddingAgents || inviteRows.length === 0}
                  startIcon={<UserPlus size={16} />}
                  sx={{ px: 3.2, borderRadius: 1, fontWeight: 800 }}
                >
                  {isAddingAgents ? "Adding..." : `Create ${inviteRows.length} Agents`}
                </Button>
              )}
            </DialogActions>
          </Box>
        </Dialog>

        {/* ── Delete Agent Confirmation Dialog ── */}
        <Dialog
          open={!!agentToDelete}
          onClose={() => (!isDeletingAgent ? setAgentToDelete(null) : null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: "grey.900" }}>Delete Agent</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Are you sure you want to delete
              {" "}
              <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: "grey.900" }}>
                {agentToDelete?.name}
              </Typography>
              ? This action cannot be undone.
            </Typography>
            {agentToDelete && !canDeleteAgent(agentToDelete) && (
              <Typography variant="caption" sx={{ color: "error.main", mt: 1.5, display: "block", fontWeight: 600 }}>
                {getDeleteRestrictionMessage(agentToDelete)}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setAgentToDelete(null)}
              disabled={isDeletingAgent}
              sx={{ color: "grey.600" }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => agentToDelete && handleRemoveAgent(agentToDelete)}
              variant="contained"
              color="error"
              disabled={isDeletingAgent || (agentToDelete ? !canDeleteAgent(agentToDelete) : false)}
            >
              {isDeletingAgent ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>


        </Dialog>
      </Box>
    </React.Fragment>
  );
}

export default AgentsManagementView;