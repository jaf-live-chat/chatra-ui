import CloseRounded from "@mui/icons-material/CloseRounded";
import AlternateEmailRounded from "@mui/icons-material/AlternateEmailRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import PhoneRounded from "@mui/icons-material/PhoneRounded";
import VerifiedUserRounded from "@mui/icons-material/VerifiedUserRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

export type AgentEditDialogFormValues = {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  role: string;
};

type AgentEditDialogProps = {
  open: boolean;
  isSaving?: boolean;
  formValues: AgentEditDialogFormValues;
  errors?: {
    fullName?: string;
    emailAddress?: string;
  };
  onClose: () => void;
  onSave: () => void;
  onChange: (next: AgentEditDialogFormValues) => void;
  maxWidth?: "xs" | "sm";
};

const AgentEditDialog = ({
  open,
  isSaving = false,
  formValues,
  errors,
  onClose,
  onSave,
  onChange,
  maxWidth = "xs",
}: AgentEditDialogProps) => {
  const handleFieldChange = (field: keyof AgentEditDialogFormValues, value: string) => {
    onChange({ ...formValues, [field]: value });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{ sx: { borderRadius: 1, overflow: "hidden" } }}
    >
      <DialogTitle sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1.3} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                bgcolor: "#e0f2fe",
                color: "#0891b2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EditOutlined sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Box component="h3" className="text-2xl font-bold leading-7 text-slate-900">
                Edit Agent Profile
              </Box>
              <Box component="p" className="text-sm font-semibold text-slate-500">
                Update personal and system details
              </Box>
            </Box>
          </Stack>

          <IconButton onClick={onClose} size="small" sx={{ color: "#94a3b8", mt: 0.1 }}>
            <CloseRounded sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ mt: 2.5 }}>
        <Stack spacing={2.2}>
          <Box>
            <Box component="p" className="mb-2 text-xs font-extrabold tracking-[0.08em] text-slate-500">
              FULL NAME
            </Box>
            <TextField
              value={formValues.fullName}
              onChange={(event) => handleFieldChange("fullName", event.target.value)}
              error={Boolean(errors?.fullName)}
              helperText={errors?.fullName || ""}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EditOutlined sx={{ fontSize: 17, color: "#94a3b8" }} />
                  </InputAdornment>
                ),
                sx: { height: 46, bgcolor: "#f8fafc", borderRadius: 1 },
              }}
            />
          </Box>

          <Box>
            <Box component="p" className="mb-2 text-xs font-extrabold tracking-[0.08em] text-slate-500">
              EMAIL ADDRESS
            </Box>
            <TextField
              value={formValues.emailAddress}
              onChange={(event) => handleFieldChange("emailAddress", event.target.value)}
              error={Boolean(errors?.emailAddress)}
              helperText={errors?.emailAddress || ""}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AlternateEmailRounded sx={{ fontSize: 17, color: "#94a3b8" }} />
                  </InputAdornment>
                ),
                sx: { height: 46, bgcolor: "#f8fafc", borderRadius: 1 },
              }}
            />
          </Box>

          <Box>
            <Box component="p" className="mb-2 text-xs font-extrabold tracking-[0.08em] text-slate-500">
              PHONE NUMBER
            </Box>
            <TextField
              value={formValues.phoneNumber}
              onChange={(event) => handleFieldChange("phoneNumber", event.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneRounded sx={{ fontSize: 17, color: "#94a3b8" }} />
                  </InputAdornment>
                ),
                sx: { height: 46, bgcolor: "#f8fafc", borderRadius: 1 },
              }}
            />
          </Box>

          <Box>
            <Box component="p" className="mb-2 text-xs font-extrabold tracking-[0.08em] text-slate-500">
              SYSTEM ROLE
            </Box>
            <TextField
              select
              value={formValues.role}
              onChange={(event) => handleFieldChange("role", event.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VerifiedUserRounded sx={{ fontSize: 17, color: "#94a3b8" }} />
                  </InputAdornment>
                ),
                sx: { height: 46, bgcolor: "#f8fafc", borderRadius: 1 },
              }}
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="SUPPORT_AGENT">Support Agent</MenuItem>
            </TextField>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          borderColor: "grey.200",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        <Button onClick={onClose} disabled={isSaving} sx={{ px: 2.4, borderRadius: 1, color: "#475569" }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSave} disabled={isSaving} sx={{ px: 2.6, borderRadius: 1.5 }}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgentEditDialog;