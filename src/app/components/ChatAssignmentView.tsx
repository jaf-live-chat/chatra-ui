import { useState } from "react";
import {
  UserCheck,
  Search,
  MessageSquare,
  Clock,
  ChevronDown,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
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
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface QueueChat {
  id: string;
  name: string;
  message: string;
  status: string;
  timeInQueue: string;
  assignedTo?: string;
}

interface Agent {
  id: string;
  name: string;
  status: "Online" | "Busy" | "Offline";
  activeChats: number;
  maxChats: number;
}

const mockAgents: Agent[] = [
  { id: "A-101", name: "Sarah Jenkins", status: "Online", activeChats: 2, maxChats: 5 },
  { id: "A-102", name: "Mark Thompson", status: "Online", activeChats: 3, maxChats: 5 },
  { id: "A-103", name: "Lisa Miller", status: "Offline", activeChats: 0, maxChats: 5 },
  { id: "A-104", name: "David Chen", status: "Online", activeChats: 1, maxChats: 5 },
  { id: "A-105", name: "Emily Davis", status: "Busy", activeChats: 5, maxChats: 5 },
];

const mockUnassignedChats: QueueChat[] = [
  { id: "Q-1001", name: "Alice Johnson", message: "I need help with upgrading my plan.", status: "Waiting", timeInQueue: "5m 20s" },
  { id: "Q-1002", name: "Michael Smith", message: "Can I connect my own custom domain?", status: "Waiting", timeInQueue: "12m 45s" },
  { id: "Q-1004", name: "James Wilson", message: "How do I add more team members?", status: "Waiting", timeInQueue: "8m 05s" },
  { id: "Q-1005", name: "Sarah Brown", message: "I am having trouble logging in.", status: "Waiting", timeInQueue: "15m 30s" },
  { id: "Q-1007", name: "Sophia Martinez", message: "Is there a way to export my data?", status: "Waiting", timeInQueue: "4m 50s" },
  { id: "Q-1009", name: "Emma Wilson", message: "How do I setup SSO?", status: "Waiting", timeInQueue: "11m 10s" },
  { id: "Q-1010", name: "Oliver Garcia", message: "Can I get a refund for my last invoice?", status: "Waiting", timeInQueue: "6m 30s" },
];

export function ChatAssignmentView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState<QueueChat[]>(mockUnassignedChats);
  const [agents] = useState<Agent[]>(mockAgents);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<QueueChat | null>(null);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [quickAssignDialogOpen, setQuickAssignDialogOpen] = useState(false);
  const [quickAssignTarget, setQuickAssignTarget] = useState<{ chat: QueueChat; agent: Agent } | null>(null);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unassignedCount = chats.filter(c => !c.assignedTo).length;
  const assignedCount = chats.filter(c => c.assignedTo).length;
  const availableAgents = agents.filter(a => a.status === "Online" && a.activeChats < a.maxChats);

  const handleOpenAssign = (chat: QueueChat) => {
    setSelectedChat(chat);
    setSelectedAgent("");
    setAssignDialogOpen(true);
  };

  const handleAssign = () => {
    if (!selectedChat || !selectedAgent) return;
    const agent = agents.find(a => a.id === selectedAgent);
    if (!agent) return;

    setChats(prev =>
      prev.map(c =>
        c.id === selectedChat.id
          ? { ...c, assignedTo: agent.name, status: "Assigned" }
          : c
      )
    );
    setSnackbar({
      open: true,
      message: `Chat ${selectedChat.id} assigned to ${agent.name}`,
      severity: "success",
    });
    setAssignDialogOpen(false);
    setSelectedChat(null);
    setSelectedAgent("");
  };

  const handleUnassign = (chatId: string) => {
    setChats(prev =>
      prev.map(c =>
        c.id === chatId
          ? { ...c, assignedTo: undefined, status: "Waiting" }
          : c
      )
    );
    setSnackbar({
      open: true,
      message: `Chat ${chatId} unassigned`,
      severity: "success",
    });
  };

  const handleAutoAssign = () => {
    const unassigned = chats.filter(c => !c.assignedTo);
    if (unassigned.length === 0 || availableAgents.length === 0) {
      setSnackbar({ open: true, message: "No chats or agents available for auto-assignment", severity: "error" });
      return;
    }

    let agentIndex = 0;
    const updated = chats.map(c => {
      if (!c.assignedTo && agentIndex < availableAgents.length) {
        const agent = availableAgents[agentIndex % availableAgents.length];
        agentIndex++;
        return { ...c, assignedTo: agent.name, status: "Assigned" };
      }
      return c;
    });

    setChats(updated);
    setSnackbar({
      open: true,
      message: `${Math.min(unassigned.length, availableAgents.length)} chats auto-assigned to available agents`,
      severity: "success",
    });
  };

  const handleQuickAssign = (chat: QueueChat) => {
    if (availableAgents.length === 0) {
      setSnackbar({ open: true, message: "No available agents for quick-assign", severity: "error" });
      return;
    }
    // Pick the agent with the fewest active chats (most availability)
    const leastBusyAgent = [...availableAgents].sort((a, b) => a.activeChats - b.activeChats)[0];
    setQuickAssignTarget({ chat, agent: leastBusyAgent });
    setQuickAssignDialogOpen(true);
  };

  const confirmQuickAssign = () => {
    if (!quickAssignTarget) return;
    const { chat, agent } = quickAssignTarget;
    setChats(prev =>
      prev.map(c =>
        c.id === chat.id
          ? { ...c, assignedTo: agent.name, status: "Assigned" }
          : c
      )
    );
    setSnackbar({
      open: true,
      message: `Chat ${chat.id} quick-assigned to ${agent.name}`,
      severity: "success",
    });
    setQuickAssignDialogOpen(false);
    setQuickAssignTarget(null);
  };

  const getTimePriority = (time: string) => {
    const minutes = parseInt(time.split("m")[0]) || 0;
    if (minutes >= 10) return "high";
    if (minutes >= 5) return "medium";
    return "low";
  };

  const avatarColors = ["#0891b2", "#B48600", "#111111", "#FF5A1F", "#A855F7"];

  return (
    <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1200, mx: "auto", display: "flex", flexDirection: "column", gap: 4, height: "calc(100vh - 64px)", overflowY: "auto" }}>
      {/* Header */}
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "flex-end" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "grey.900" }}>Chat Assignment</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Assign queued chats to available agents or auto-distribute.</Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Box sx={{ position: "relative", width: { xs: "100%", sm: 260 } }}>
            <Box sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "text.secondary", display: "flex" }}>
              <Search size={18} />
            </Box>
            <InputBase
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                width: "100%", pl: 4.5, pr: 2, py: 1,
                bgcolor: "background.paper", border: "1px solid", borderColor: "grey.200",
                borderRadius: 2, fontSize: "0.875rem",
                "&.Mui-focused": { borderColor: "primary.main" }
              }}
              fullWidth
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<UserCheck size={18} />}
            onClick={handleAutoAssign}
            sx={{ fontWeight: 600, px: 3, flexShrink: 0, borderRadius: 2 }}
          >
            Auto-Assign All
          </Button>
        </Stack>
      </Stack>

      {/* Stats */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>Unassigned Chats</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "grey.900" }}>{unassignedCount}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: "#EAB3081F", color: "#7a5d00", width: 48, height: 48 }}>
              <AlertCircle size={24} />
            </Avatar>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>Assigned Chats</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "grey.900" }}>{assignedCount}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: "#16A34A1F", color: "success.dark", width: 48, height: 48 }}>
              <CheckCircle size={24} />
            </Avatar>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>Available Agents</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "grey.900" }}>{availableAgents.length}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: "#0000000F", color: "grey.700", width: 48, height: 48 }}>
              <UserCheck size={24} />
            </Avatar>
          </Paper>
        </Grid>
      </Grid>

      {/* Chat Assignment Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3, overflow: "visible" }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ bgcolor: "background.paper", borderBottom: "2px solid", borderColor: "grey.200" }}>
            <TableRow>
              <TableCell width="20%">VISITOR</TableCell>
              <TableCell width="30%">MESSAGE</TableCell>
              <TableCell width="12%" align="center">WAIT TIME</TableCell>
              <TableCell width="13%" align="center">STATUS</TableCell>
              <TableCell width="15%">ASSIGNED TO</TableCell>
              <TableCell width="10%" align="center">ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const charCode = chat.id.charCodeAt(chat.id.length - 1) || 0;
                const avatarColor = avatarColors[charCode % avatarColors.length];
                const priority = getTimePriority(chat.timeInQueue);

                return (
                  <TableRow key={chat.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: avatarColor, fontSize: "0.875rem", fontWeight: 600 }}>
                          {chat.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900" }}>{chat.name}</Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>{chat.id}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
                        {chat.message}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                        <Clock size={14} color={priority === "high" ? "#DC2626" : priority === "medium" ? "#ca8a04" : "#6b7280"} />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: priority === "high" ? "error.main" : priority === "medium" ? "#7a5d00" : "text.secondary",
                          }}
                        >
                          {chat.timeInQueue}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: chat.assignedTo ? "success.main" : "warning.main", ml: 1 }} />}
                        label={chat.assignedTo ? "Assigned" : "Waiting"}
                        size="small"
                        sx={{
                          bgcolor: chat.assignedTo ? "#16A34A1F" : "#EAB3081F",
                          color: chat.assignedTo ? "success.dark" : "#7a5d00",
                          fontWeight: 600,
                          "& .MuiChip-icon": { ml: 1 }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {chat.assignedTo ? (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900" }}>{chat.assignedTo}</Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>Unassigned</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {chat.assignedTo ? (
                        <Button
                          onClick={() => handleUnassign(chat.id)}
                          variant="outlined"
                          color="error"
                          size="small"
                          sx={{ minWidth: 0, px: 2, py: 0.5, borderColor: "error.light", "&:hover": { bgcolor: "error.light", color: "white" } }}
                        >
                          Unassign
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleQuickAssign(chat)}
                          variant="outlined"
                          size="small"
                          sx={{ minWidth: 0, px: 2, py: 0.5, color: "grey.700", borderColor: "grey.300", bgcolor: "grey.50", "&:hover": { bgcolor: "grey.100", borderColor: "grey.400" } }}
                        >
                          Assign
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Stack alignItems="center" spacing={2} sx={{ color: "text.secondary" }}>
                    <MessageSquare size={48} color="#d1d5db" />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "grey.900" }}>No chats found</Typography>
                      <Typography variant="body2">All chats have been assigned or the queue is empty.</Typography>
                    </Box>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "grey.900" }}>Assign Chat</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          {selectedChat && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900" }}>{selectedChat.name}</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>{selectedChat.message}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <Clock size={12} color="#6b7280" />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Waiting: {selectedChat.timeInQueue}</Typography>
              </Stack>
            </Paper>
          )}

          <FormControl fullWidth size="small">
            <InputLabel>Select Agent</InputLabel>
            <Select
              value={selectedAgent}
              label="Select Agent"
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              {agents.map((agent) => (
                <MenuItem
                  key={`assign-agent-${agent.id}`}
                  value={agent.id}
                  disabled={agent.status === "Offline" || agent.activeChats >= agent.maxChats}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: agent.status === "Online" ? "success.main" : agent.status === "Busy" ? "warning.main" : "grey.400",
                        }}
                      />
                      <Typography variant="body2">{agent.name}</Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {agent.activeChats}/{agent.maxChats} chats
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setAssignDialogOpen(false)} sx={{ color: "grey.600" }}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained" color="primary" disabled={!selectedAgent}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Quick Assign Dialog */}
      <Dialog open={quickAssignDialogOpen} onClose={() => setQuickAssignDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "grey.900" }}>Quick Assign Chat</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          {quickAssignTarget && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900" }}>{quickAssignTarget.chat.name}</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>{quickAssignTarget.chat.message}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <Clock size={12} color="#6b7280" />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Waiting: {quickAssignTarget.chat.timeInQueue}</Typography>
              </Stack>
            </Paper>
          )}

          {quickAssignTarget && (
            <FormControl fullWidth size="small">
              <InputLabel id="quick-assign-agent-label">Assign to Agent</InputLabel>
              <Select
                labelId="quick-assign-agent-label"
                value={quickAssignTarget.agent.id}
                label="Assign to Agent"
                onChange={(e) => {
                  const agent = agents.find(a => a.id === e.target.value);
                  if (agent && quickAssignTarget) {
                    setQuickAssignTarget({ ...quickAssignTarget, agent });
                  }
                }}
                sx={{ borderRadius: 2 }}
              >
                {agents.filter(a => a.status !== "Offline").map((agent) => (
                  <MenuItem key={agent.id} value={agent.id} disabled={agent.activeChats >= agent.maxChats}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%" }}>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900" }}>{agent.name}</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {agent.activeChats}/{agent.maxChats} chats •{" "}
                          <Box
                            component="span"
                            sx={{
                              color: agent.status === "Online" ? "success.main" : agent.status === "Busy" ? "warning.main" : "text.disabled",
                              fontWeight: 600,
                            }}
                          >
                            {agent.status}
                          </Box>
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setQuickAssignDialogOpen(false)} sx={{ color: "grey.600" }}>Cancel</Button>
          <Button onClick={confirmQuickAssign} variant="contained" color="primary">Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}