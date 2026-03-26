import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { useAppLoading } from "../providers/AppLoadingProvider";

export default function GlobalLoadingOverlay() {
  const { isBlocking, message } = useAppLoading();

  return (
    <Modal
      open={isBlocking}
      keepMounted
      disableEscapeKeyDown
      aria-labelledby="global-loading-title"
      aria-describedby="global-loading-description"
      sx={{ zIndex: (theme) => theme.zIndex.modal + 3000, cursor: "progress" }}
    >
      <Fade in={isBlocking} timeout={{ enter: 180, exit: 120 }}>
        <Box
          role="status"
          aria-live="assertive"
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(12, 18, 28, 0.45)",
            backdropFilter: "blur(1.5px)",
            pointerEvents: "auto",
          }}
        >
          <Box
            sx={{
              minWidth: 240,
              borderRadius: 2,
              px: 4,
              py: 3,
              bgcolor: "background.paper",
              boxShadow: 8,
              textAlign: "center",
            }}
          >
            <CircularProgress size={36} />
            <Typography id="global-loading-title" variant="body1" sx={{ mt: 2, fontWeight: 600 }}>
              {message || "Processing..."}
            </Typography>
            <Typography
              id="global-loading-description"
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              Please wait while we complete your request.
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
