import { AlertTriangle } from "lucide-react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Typography } from "@mui/material";

type AutoLogoutModalProps = {
  open: boolean;
  secondsLeft: number;
  onStaySignedIn: () => void;
  onLogoutNow: () => void;
};

const WARNING_SECONDS = 30;

const AutoLogoutModal = ({
  open,
  secondsLeft,
  onStaySignedIn,
  onLogoutNow,
}: AutoLogoutModalProps) => {
  const safeSecondsLeft = Math.max(0, secondsLeft);
  const progressValue = (safeSecondsLeft / WARNING_SECONDS) * 100;

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === "escapeKeyDown" || reason === "backdropClick") {
          return;
        }
      }}
      aria-labelledby="auto-logout-title"
      aria-describedby="auto-logout-description"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id="auto-logout-title" sx={{ pb: 1.25 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: "10px",
              bgcolor: "warning.100",
              color: "warning.dark",
            }}
          >
            <AlertTriangle size={18} />
          </Box>
          <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 700 }}>
            Session Timeout Warning
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: "4px !important" }}>
        <Typography id="auto-logout-description" variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          You&apos;ll be logout due to inactivity.
        </Typography>

        <Box
          sx={{
            borderRadius: "10px",
            border: "1px solid",
            borderColor: "divider",
            p: 1.5,
            mb: 1,
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.75 }}>
            Logging out in
          </Typography>
          <Typography variant="h4" sx={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1 }}>
            {safeSecondsLeft}s
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            sx={{
              mt: 1.5,
              height: 8,
              borderRadius: 999,
              backgroundColor: "action.hover",
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 0.5 }}>
        <Button variant="outlined" color="inherit" onClick={onLogoutNow}>
          Logout Now
        </Button>
        <Button variant="contained" onClick={onStaySignedIn}>
          Stay Signed In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutoLogoutModal;
