import { useEffect, useState } from "react";
import { UserPlus, X } from "lucide-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { QueueAgentOption, QueueVisitorRow } from "../../../models/QueueViewModel";
import toTitleCase from "../../../utils/toTitleCase";
import { Chip } from "@mui/material";

interface QueueAssignDialogProps {
  open: boolean;
  visitor: QueueVisitorRow | null;
  agents: QueueAgentOption[];
  loading?: boolean;
  onClose: () => void;
  onAssign: (agentId: string) => Promise<void>;
}

const QueueAssignDialog = ({
  open,
  visitor,
  agents,
  loading = false,
  onClose,
  onAssign,
}: QueueAssignDialogProps) => {
  const [selectedAgentId, setSelectedAgentId] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedAgentId("");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
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
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: "#0891b220",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserPlus size={16} color="#0891b2" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Assign Chat
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Assign {visitor?.name || "visitor"} to an available agent
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <X size={18} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="assign-agent-select-label">Select Agent</InputLabel>
          <Select
            labelId="assign-agent-select-label"
            value={selectedAgentId}
            label="Select Agent"
            onChange={(event) => setSelectedAgentId(String(event.target.value || ""))}
          >
            {agents.map((agent) => (
              <MenuItem key={agent.id} value={agent.id}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
                  <Typography variant="body2">{agent.name}</Typography>
                  <Chip
                    label={toTitleCase(agent.status)}
                    size="small"
                    color={agent.status === "AVAILABLE" ? "success" : agent.status === "BUSY" ? "warning" : "default"}
                  />
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!selectedAgentId || loading}
          onClick={() => {
            void onAssign(selectedAgentId);
          }}
          sx={{ fontWeight: 700 }}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QueueAssignDialog;
