import { useState, useMemo } from "react";
import {
  UserPlus,
  Search,
  Headset,
  Circle,
  ChevronLeft,
  ChevronRight,
  Link2,
  Trash2,
  Plus,
} from "lucide-react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

interface Agent {
  id: string;
  name: string;
  email: string;
  status: "Online" | "Offline";
  role: "Admin" | "Support Agent";
  autoAssign: boolean;
  chatsHandled: number;
}

const mockAgents: Agent[] = [
  { id: "A-101", name: "Sarah Jenkins",  email: "sarah.j@jafdigital.com",  status: "Online",  role: "Admin",         autoAssign: true,  chatsHandled: 42 },
  { id: "A-102", name: "Mark Thompson",  email: "mark.t@jafdigital.com",   status: "Online",  role: "Support Agent", autoAssign: true,  chatsHandled: 28 },
  { id: "A-103", name: "Lisa Miller",    email: "lisa.m@jafdigital.com",   status: "Offline", role: "Support Agent", autoAssign: false, chatsHandled: 15 },
  { id: "A-104", name: "David Chen",     email: "david.c@jafdigital.com",  status: "Online",  role: "Support Agent", autoAssign: false, chatsHandled: 34 },
  { id: "A-105", name: "Emily Davis",    email: "emily.d@jafdigital.com",  status: "Offline", role: "Support Agent", autoAssign: false, chatsHandled: 0  },
];

const avatarColors = ["#FF5A1F", "#1F75FE", "#A855F7", "#B48600", "#0891b2"];
function getAvatarColor(id: string) {
  const charCode = id.charCodeAt(id.length - 1) || 0;
  return avatarColors[charCode % avatarColors.length];
}

const ITEMS_PER_PAGE = 5;

export function AgentsManagementView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [agents, setAgents]         = useState<Agent[]>(mockAgents);
  const [editAgent, setEditAgent]   = useState<Agent | null>(null);
  const [editForm, setEditForm]     = useState({ name: "", email: "", role: "Support Agent" as "Admin" | "Support Agent", autoAssign: false });
  const [page, setPage]             = useState(1);
  const [addOpen, setAddOpen]       = useState(false);
  const [inviteRows, setInviteRows] = useState<Array<{ email: string; role: "Admin" | "Support Agent" }>>([{ email: "", role: "Support Agent" }]);
  const [inviteErrors, setInviteErrors] = useState<Array<{ email: string }>>([{ email: "" }]);
  const [inviteCopied, setInviteCopied] = useState(false);

  const filteredAgents = useMemo(
    () =>
      agents.filter(
        (a) =>
          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.email.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [agents, searchTerm]
  );

  const totalPages   = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
  const pagedAgents  = filteredAgents.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleRemoveAgent = (id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
    setPage(1);
  };

  const handleEditOpen  = (agent: Agent) => { setEditAgent(agent); setEditForm({ name: agent.name, email: agent.email, role: agent.role, autoAssign: agent.autoAssign }); };
  const handleEditSave  = () => {
    if (!editAgent) return;
    setAgents((prev) => prev.map((a) => a.id === editAgent.id ? { ...a, ...editForm } : a));
    setEditAgent(null);
  };
  const handleEditClose = () => setEditAgent(null);

  const handleAddOpen  = () => {
    setInviteRows([{ email: "", role: "Support Agent" }]);
    setInviteErrors([{ email: "" }]);
    setInviteCopied(false);
    setAddOpen(true);
  };
  const handleAddClose = () => setAddOpen(false);
  const handleAddSave  = () => {
    const errors = inviteRows.map((row) => {
      const err = { email: "" };
      if (!row.email.trim()) err.email = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) err.email = "Enter a valid email.";
      else if (agents.some((a) => a.email.toLowerCase() === row.email.toLowerCase())) err.email = "Already exists.";
      return err;
    });
    if (errors.some((e) => e.email)) { setInviteErrors(errors); return; }
    const newAgents = inviteRows.map((row) => {
      const newId = `A-${101 + agents.length + Math.floor(Math.random() * 900)}`;
      const namePart = row.email.split("@")[0].replace(/[^a-zA-Z]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return { id: newId, name: namePart, email: row.email.trim(), status: "Online" as const, role: row.role, autoAssign: false, chatsHandled: 0 };
    });
    setAgents((prev) => [...prev, ...newAgents]);
    setAddOpen(false);
  };
  const handleAddRow = () => {
    setInviteRows((prev) => [...prev, { email: "", role: "Support Agent" }]);
    setInviteErrors((prev) => [...prev, { email: "" }]);
  };
  const handleRemoveRow = (index: number) => {
    if (inviteRows.length <= 1) return;
    setInviteRows((prev) => prev.filter((_, i) => i !== index));
    setInviteErrors((prev) => prev.filter((_, i) => i !== index));
  };
  const handleUpdateRow = (index: number, field: "email" | "role", value: string) => {
    setInviteRows((prev) => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
    if (field === "email") setInviteErrors((prev) => prev.map((err, i) => i === index ? { email: "" } : err));
  };
  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText("https://jafchatra.com/invite/join-team").then(() => {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    });
  };

  // ── Pagination bar ──────────────────────────────────────────────────────────
  const PaginationBar = () =>
    totalPages > 1 ? (
      <Box
        sx={{
          px: 3, py: 1.5,
          borderTop: "1px solid", borderColor: "grey.200",
          bgcolor: "grey.50",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
          Showing{" "}
          <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: "grey.900", fontSize: "0.8rem" }}>
            {(page - 1) * ITEMS_PER_PAGE + 1}
          </Typography>
          –
          <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: "grey.900", fontSize: "0.8rem" }}>
            {Math.min(page * ITEMS_PER_PAGE, filteredAgents.length)}
          </Typography>
          {" "}of{" "}
          <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: "grey.900", fontSize: "0.8rem" }}>
            {filteredAgents.length}
          </Typography>
          {" "}agents
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            size="small"
            sx={{ border: "1px solid", borderColor: "grey.200", bgcolor: "background.paper", borderRadius: 1.5 }}
          >
            <ChevronLeft size={16} />
          </IconButton>
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i}
              onClick={() => setPage(i + 1)}
              sx={{
                minWidth: 30, p: 0, height: 30, borderRadius: 1.5,
                bgcolor: page === i + 1 ? "primary.main" : "transparent",
                color:   page === i + 1 ? "#ffffff"      : "text.secondary",
                fontWeight: page === i + 1 ? 700 : 500,
                fontSize: "0.8rem",
                "&:hover": { bgcolor: page === i + 1 ? "primary.dark" : "grey.100" },
              }}
            >
              {i + 1}
            </Button>
          ))}
          <IconButton
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            size="small"
            sx={{ border: "1px solid", borderColor: "grey.200", bgcolor: "background.paper", borderRadius: 1.5 }}
          >
            <ChevronRight size={16} />
          </IconButton>
        </Stack>
      </Box>
    ) : null;

  // ── Empty state ─────────────────────────────────────────────────────────────
  const EmptyState = () => (
    <TableRow>
      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
        <Stack alignItems="center" spacing={1.5} sx={{ color: "text.secondary" }}>
          <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Headset size={22} color="#9ca3af" />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "grey.900" }}>No agents found</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>Adjust your search or add a new agent.</Typography>
          </Box>
        </Stack>
      </TableCell>
    </TableRow>
  );

  return (
    <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1200, mx: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
      {/* ── Page header ── */}
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "flex-end" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "grey.900" }}>Agents Management</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Manage your support team, their statuses, and performance.</Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<UserPlus size={18} />}
            onClick={handleAddOpen}
            sx={{ fontWeight: 600, px: 3, flexShrink: 0, borderRadius: 2 }}
          >
            Add Agent
          </Button>
        </Stack>
      </Stack>

      {/* ── Stat cards ── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>Total Agents</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "grey.900" }}>{agents.length}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: "grey.100", color: "grey.600", width: 48, height: 48 }}>
              <Headset size={24} />
            </Avatar>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>Online Agents</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "grey.900" }}>{agents.filter((a) => a.status === "Online").length}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: "success.light", color: "success.dark", width: 48, height: 48 }}>
              <Circle size={24} className="fill-current" />
            </Avatar>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>Chats Handled Today</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "grey.900" }}>{agents.reduce((sum, a) => sum + a.chatsHandled, 0)}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: "info.light", color: "info.dark", width: 48, height: 48 }}>
              <Headset size={24} />
            </Avatar>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Agents table — styled like the Waiting Queue table ── */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>

        {/* Section header */}
        <Box sx={{
          px: 3, py: 2,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid", borderColor: "grey.200",
          background: "linear-gradient(135deg, #0891b210 0%, #0891b204 100%)",
        }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "#0891b220", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Headset size={17} color="#0891b2" />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "grey.900", lineHeight: 1.2 }}>Support Agents</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>All registered agents and their current status</Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              icon={<Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "success.main", ml: 0.5 }} />}
              label={`${agents.filter((a) => a.status === "Online").length} online`}
              size="small"
              sx={{ bgcolor: "#16a34a1a", color: "#15803d", fontWeight: 700, height: 26, "& .MuiChip-icon": { ml: 0.5 } }}
            />
            <Chip
              label={`${filteredAgents.length} agents`}
              size="small"
              sx={{ bgcolor: "#0891b21a", color: "#0e7490", fontWeight: 700, height: 26 }}
            />
          </Stack>
        </Box>

        {/* Table */}
        <TableContainer sx={{ overflow: "visible" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell width="6%"  align="center">#</TableCell>
                <TableCell width="27%">Agent</TableCell>
                <TableCell width="25%">Email</TableCell>
                <TableCell width="14%"  align="center">Status</TableCell>
                <TableCell width="12%"  align="center">Chats</TableCell>
                <TableCell width="16%"  align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedAgents.length > 0 ? (
                pagedAgents.map((agent, index) => {
                  const pos     = (page - 1) * ITEMS_PER_PAGE + index + 1;
                  const isFirst = pos === 1;

                  return (
                    <TableRow
                      key={agent.id}
                      hover
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        transition: "background 0.15s",
                        ...(isFirst && {
                          bgcolor: "#0891b20f",
                          borderLeft: "3px solid",
                          borderLeftColor: "primary.main",
                          "& td:first-of-type": { pl: 1.5 },
                          "& td": { py: 2.5 },
                        }),
                      }}
                    >
                      {/* # */}
                      <TableCell align="center">
                        <Box sx={{
                          width: isFirst ? 38 : 28, height: isFirst ? 38 : 28, borderRadius: 1.5, mx: "auto",
                          bgcolor: isFirst ? "primary.main" : "grey.100",
                          color:   isFirst ? "#fff"         : "grey.700",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: isFirst ? "1rem" : "0.8rem",
                          ...(isFirst && { boxShadow: "0 2px 8px #0891b259" }),
                        }}>
                          {pos}
                        </Box>
                      </TableCell>

                      {/* Agent */}
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={isFirst ? 2 : 1.5}>
                          <Avatar sx={{
                            width: isFirst ? 46 : 36, height: isFirst ? 46 : 36,
                            bgcolor: getAvatarColor(agent.id),
                            fontSize: isFirst ? "1.1rem" : "0.875rem", fontWeight: 700,
                            ...(isFirst && { boxShadow: "0 0 0 2px #0891b2" }),
                          }}>
                            {agent.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant={isFirst ? "body1" : "body2"} sx={{ fontWeight: isFirst ? 700 : 600, color: "grey.900", lineHeight: 1.2 }}>
                                {agent.name}
                              </Typography>
                              {isFirst && (
                                <Chip label="Top Agent" size="small" sx={{
                                  height: 20, fontSize: "0.65rem", fontWeight: 800,
                                  bgcolor: "primary.main", color: "#fff", letterSpacing: "0.03em",
                                  "& .MuiChip-label": { px: 0.75, py: 0 },
                                }} />
                              )}
                            </Stack>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: isFirst ? "0.75rem" : "0.7rem" }}>{agent.id}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Email */}
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }} title={agent.email}>
                          {agent.email}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center">
                        <Chip
                          icon={<Circle size={8} className="fill-current" />}
                          label={agent.status}
                          size="small"
                          sx={{
                            bgcolor: agent.status === "Online" ? "#16A34A1F" : "#0000000F",
                            color:   agent.status === "Online" ? "success.dark" : "grey.700",
                            fontWeight: 600,
                            height: isFirst ? 28 : 24,
                            "& .MuiChip-icon": { ml: 1, color: "inherit" },
                          }}
                        />
                      </TableCell>

                      {/* Chats */}
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 700, color: isFirst ? "primary.dark" : "text.secondary" }}>
                          {agent.chatsHandled}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                          <Button
                            onClick={() => handleEditOpen(agent)}
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 0, px: 2, py: 0.5, color: "grey.700", borderColor: "grey.300", bgcolor: "grey.50", "&:hover": { bgcolor: "grey.100", borderColor: "grey.400" } }}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleRemoveAgent(agent.id)}
                            variant="outlined"
                            color="error"
                            size="small"
                            sx={{ minWidth: 0, px: 2, py: 0.5, borderColor: "error.light", bgcolor: "error.lighter", "&:hover": { bgcolor: "error.light", color: "white" } }}
                          >
                            Remove
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <EmptyState />
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <PaginationBar />
      </Paper>

      {/* ── Edit Agent Dialog ── */}
      <Dialog open={!!editAgent} onClose={handleEditClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "grey.900" }}>Edit Agent</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            fullWidth size="small"
          />
          <TextField
            label="Email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            fullWidth size="small"
          />
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={editForm.role}
              label="Role"
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value as "Admin" | "Support Agent" })}
            >
              <MenuItem key="role-admin"         value="Admin">Admin</MenuItem>
              <MenuItem key="role-support-agent" value="Support Agent">Support Agent</MenuItem>
            </Select>
          </FormControl>
          <Box
            sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              px: 1.5, py: 1, borderRadius: 2,
              border: "1px solid", borderColor: editForm.autoAssign ? "#0891b240" : "grey.200",
              bgcolor: editForm.autoAssign ? "#0891b20a" : "grey.50",
              transition: "all 0.2s",
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.800" }}>
                Auto Assign
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Automatically assign incoming chats to this agent
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.autoAssign}
                  onChange={(e) => setEditForm({ ...editForm, autoAssign: e.target.checked })}
                  size="small"
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#0891b2" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#0891b2" },
                  }}
                />
              }
              label={
                <Typography variant="caption" sx={{ fontWeight: 700, color: editForm.autoAssign ? "#0891b2" : "grey.500" }}>
                  {editForm.autoAssign ? "ON" : "OFF"}
                </Typography>
              }
              labelPlacement="start"
              sx={{ m: 0, gap: 0.5 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleEditClose} sx={{ color: "grey.600" }}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* ── Add Agent Dialog ── */}
      <Dialog open={addOpen} onClose={handleAddClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "grey.900" }}>Add New Agent</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          {inviteRows.map((row, index) => (
            <Stack key={index} direction="row" alignItems="center" spacing={1.5}>
              <TextField
                label="Email"
                value={row.email}
                onChange={(e) => handleUpdateRow(index, "email", e.target.value)}
                error={!!inviteErrors[index].email}
                helperText={inviteErrors[index].email}
                fullWidth size="small"
                placeholder="e.g. jane.s@jafdigital.com"
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={row.role}
                  label="Role"
                  onChange={(e) => handleUpdateRow(index, "role", e.target.value as "Admin" | "Support Agent")}
                >
                  <MenuItem key="role-admin"         value="Admin">Admin</MenuItem>
                  <MenuItem key="role-support-agent" value="Support Agent">Support Agent</MenuItem>
                </Select>
              </FormControl>
              <IconButton
                onClick={() => handleRemoveRow(index)}
                disabled={inviteRows.length <= 1}
                size="small"
                sx={{ color: "grey.500", "&:hover": { color: "grey.700" } }}
              >
                <Trash2 size={16} />
              </IconButton>
            </Stack>
          ))}
          <Button
            onClick={handleAddRow}
            variant="outlined"
            size="small"
            sx={{ mt: 1, color: "grey.700", borderColor: "grey.300", bgcolor: "grey.50", "&:hover": { bgcolor: "grey.100", borderColor: "grey.400" } }}
          >
            Add Another Agent
          </Button>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>Or invite agents via link:</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Link2 size={16} color="#0891b2" />
              <Typography variant="body2" sx={{ color: "primary.main", cursor: "pointer" }} onClick={handleCopyInviteLink}>
                {inviteCopied ? "Copied!" : "https://jafchatra.com/invite/join-team"}
              </Typography>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleAddClose} sx={{ color: "grey.600" }}>Cancel</Button>
          <Button onClick={handleAddSave} variant="contained" color="primary" startIcon={<UserPlus size={16} />}>Add Agent</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}