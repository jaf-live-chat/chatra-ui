import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import AlternateEmailRounded from "@mui/icons-material/AlternateEmailRounded";
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import FiberManualRecordRounded from "@mui/icons-material/FiberManualRecordRounded";
import FingerprintRounded from "@mui/icons-material/FingerprintRounded";
import PhoneRounded from "@mui/icons-material/PhoneRounded";
import StarBorderRounded from "@mui/icons-material/StarBorderRounded";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Agents from "../../services/agentServices";
import type { AuthAgent } from "../../models/AgentModel";
import toTitleCase from "../../utils/toTitleCase";
import AgentEditDialog from "./components/AgentEditDialog";


type AgentDetails = AuthAgent & {
  isFirstLogin?: boolean;
  createdAt?: string;
  updatedAt?: string;
  totalResolved?: number;
  averageRating?: number;
};

type EditProfileForm = {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  role: string;
  status: string;
};

const formatStatus = (status: string) =>
  status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getStatusDotColor = (status?: string): string => {
  switch (status) {
    case "ONLINE":
      return "#16a34a";
    case "BUSY":
      return "#f97316";
    case "AWAY":
      return "#eab308";
    default:
      return "#64748b";
  }
};

const feedbackItems = [
  {
    id: "f-1",
    name: "Sarah Jenkins",
    when: "2 days ago",
    rating: 5,
    comment: "John was incredibly helpful and resolved my billing issue in minutes. Very polite!",
  },
  {
    id: "f-2",
    name: "Mark Davis",
    when: "1 week ago",
    rating: 4,
    comment: "Good service, he knew exactly what to do. Just took a little bit to get connected.",
  },
  {
    id: "f-3",
    name: "Emily R.",
    when: "2 weeks ago",
    rating: 5,
    comment: "Probably the best support experience I've had. Walked me through the whole setup process.",
  },
];

const InfoCard = ({
  icon,
  label,
  value,
  hint,
  action,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  action?: ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 1,
      height: "100%",
      bgcolor: "background.paper",
    }}
  >
    <Stack direction="row" spacing={1.2} alignItems="flex-start">
      <Avatar
        variant="rounded"
        sx={{
          width: 30,
          height: 30,
          bgcolor: "#0891b214",
          color: "primary.dark",
          borderRadius: 1.5,
        }}
      >
        {icon}
      </Avatar>
      <Stack spacing={0.35} sx={{ minWidth: 0, flex: 1 }}>
        <Box component="p" className="text-s font-medium uppercase tracking-[0.04em] ">
          {label}
        </Box>
        <Stack direction="row" spacing={0.8} alignItems="center">
          <Box component="p" className="text-xs font-small leading-5 ">
            {value}
          </Box>
          {action}
        </Stack>
        {hint && (
          <Box component="p" className="text-[0.92rem] text-gray-500 dark:text-slate-400">
            {hint}
          </Box>
        )}
      </Stack>
    </Stack>
  </Paper>
);

const AgentDetailsView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [error, setError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditProfileForm>({
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
    role: "SUPPORT_AGENT",
    status: "OFFLINE",
  });
  const [editErrors, setEditErrors] = useState({
    fullName: "",
    emailAddress: "",
  });

  useEffect(() => {
    const loadAgent = async () => {
      if (!id) {
        setError("Agent id is required.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const response = await Agents.getAgent(id);
        setAgent(response.agent as AgentDetails);
      } catch (err) {
        console.error(err);
        setError("Failed to load agent details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAgent();
  }, [id]);

  const initials = useMemo(() => {
    const name = agent?.fullName?.trim();
    if (!name) return "A";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }, [agent]);

  const totalResolved = Number.isFinite(agent?.totalResolved)
    ? Number(agent?.totalResolved)
    : 0;
  const averageRating = Number.isFinite(agent?.averageRating)
    ? Number(agent?.averageRating)
    : 0;

  const handleCopyAgentId = async () => {
    if (!agent) {
      return;
    }

    try {
      await navigator.clipboard.writeText(agent._id);
      toast.success("Agent ID copied");
    } catch {
      toast.error("Unable to copy Agent ID");
    }
  };

  const handleOpenEdit = () => {
    if (!agent) return;
    setEditForm({
      fullName: agent.fullName || "",
      emailAddress: agent.emailAddress || "",
      phoneNumber: agent.phoneNumber || "",
      role: agent.role || "SUPPORT_AGENT",
      status: agent.status || "OFFLINE",
    });
    setEditErrors({
      fullName: "",
      emailAddress: "",
    });
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    if (isSaving) return;
    setIsEditOpen(false);
  };

  const validateEditForm = () => {
    const nextErrors = {
      fullName: "",
      emailAddress: "",
    };

    if (!editForm.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!editForm.emailAddress.trim()) {
      nextErrors.emailAddress = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.emailAddress.trim())) {
      nextErrors.emailAddress = "Enter a valid email address.";
    }

    setEditErrors(nextErrors);
    return !nextErrors.fullName && !nextErrors.emailAddress;
  };

  const handleSaveEdit = async () => {
    if (!agent) return;
    if (!validateEditForm()) return;

    try {
      setIsSaving(true);
      const response = await Agents.updateAgent(agent._id, {
        fullName: editForm.fullName.trim(),
        emailAddress: editForm.emailAddress.trim(),
        phoneNumber: editForm.phoneNumber.trim() || null,
        role: editForm.role,
        status: editForm.status,
      });

      setAgent((prev) => ({
        ...(prev || agent),
        ...response.agent,
      }));
      setIsEditOpen(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 4, borderRadius: 1 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <CircularProgress size={22} sx={{ color: "primary.main" }} />
          <Box component="p" className="text-sm text-gray-500 dark:text-slate-400">
            Loading agent details...
          </Box>
        </Stack>
      </Paper>
    );
  }

  if (error || !agent) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 1,
          bgcolor: "#fef2f2",
        }}
      >
        <Box component="h2" className="mb-1 text-xl font-semibold text-red-700 dark:text-red-400">
          Unable to Load Agent
        </Box>
        <Box component="p" className="mb-2.5 text-sm text-red-700 dark:text-red-400">
          {error || "Agent not found."}
        </Box>
        <Button variant="contained" color="primary" onClick={() => navigate("/portal/agents")}>Back to Agents</Button>
      </Paper>
    );
  }

  return (
    <Stack
      spacing={3.5}
      className="font-sans"
      sx={{
        "& .MuiButton-root, & .MuiChip-label, & .MuiInputBase-input, & .MuiInputLabel-root, & .MuiFormHelperText-root": {
          fontFamily: "inherit",
        },
      }}
    >
      <Button
        variant="text"
        startIcon={<ArrowBackRounded />}
        onClick={() => navigate("/portal/agents")}
        className="!text-sm !font-semibold"
        sx={{
          width: "fit-content",
          color: "text.secondary",
          textTransform: "none",
          px: 0,
          "&:hover": { bgcolor: "transparent", color: "grey.900" },
        }}
      >
        Back to Agents
      </Button>

      <Card
        elevation={0}
        sx={{ borderRadius: 1, bgcolor: "background.paper", border: "none", boxShadow: "none" }}
      >
        <CardContent sx={{ p: { xs: 2.2, md: 3.5 } }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            alignItems={{ xs: "flex-start", lg: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: "primary.main",
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  boxShadow: "0 10px 24px #0891b228",
                }}
                src={agent.profilePicture || undefined}
              >
                {initials}
              </Avatar>
              <Box>

                <Box>
                  <Box component="h2" className="text-[2.2rem] leading-none tracking-tight text-gray-900 dark:text-slate-100">
                    {toTitleCase(agent.fullName)}
                  </Box>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                    sx={{ mt: 1.1 }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.9}
                      alignItems="center"
                      className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800/70"
                    >
                      <FingerprintRounded sx={{ fontSize: 14, color: "#94a3b8" }} />
                      <Box component="p" className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                        {agent._id}
                      </Box>
                      <IconButton size="small" onClick={handleCopyAgentId} sx={{ p: 0.2 }}>
                        <ContentCopyRounded sx={{ fontSize: 14, color: "#94a3b8" }} />
                      </IconButton>
                    </Stack>

                    <Box component="span" sx={{ color: "grey.400", display: { xs: "none", sm: "block" } }}>
                      •
                    </Box>
                    <Chip
                      label={<span className="text-xs font-semibold tracking-wide">{toTitleCase((agent.role || "").replaceAll("_", " "))}</span>}
                      size="small"
                      sx={{
                        bgcolor: "#0891b21a",
                        color: "primary.dark",
                        border: "1px solid #0891b240",
                        height: 30,
                      }}
                    />
                  
                    <Stack direction="row" spacing={0.6} alignItems="center">
                      <FiberManualRecordRounded sx={{ fontSize: "0.55rem", color: getStatusDotColor(agent.status) }} />
                      <Box component="span" className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                        {formatStatus(agent.status || "N/A")}
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              startIcon={<EditOutlined />}
              onClick={handleOpenEdit}
              className="!text-sm !font-semibold"
              sx={{
                borderColor: "grey.200",
                bgcolor: "grey.50",
                color: "grey.800",
                borderRadius: 3,
                px: 2.4,
                "&:hover": { borderColor: "grey.300", bgcolor: "grey.100" },
              }}
            >
              Edit Profile
            </Button>
          </Stack>
       

          <Stack direction="row" spacing={6} sx={{ mt: 3.3, mb: 3.2, flexWrap: "wrap", rowGap: 2 }}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.7}>
                <ChatBubbleOutlineRounded sx={{ fontSize: 18, color: "#2563eb" }} />
                <Box component="p" className="text-[0.68rem] font-semibold uppercase tracking-wider ">
                  Total Resolved
                </Box>
              </Stack>
              <Box component="p" className="mt-1 text-center text-2xl font-bold leading-none text-gray-900 dark:text-slate-100">
                {totalResolved}
              </Box>
            </Box>

            <Box>
              <Stack direction="row" alignItems="center" spacing={0.7}>
                <StarBorderRounded sx={{ fontSize: 18, color: "#f59e0b" }} />
                <Box component="p" className="text-[0.68rem] font-semibold uppercase tracking-wider ">
                  Average Rating
                </Box>
              </Stack>
              <Box component="p" className="mt-1 text-center text-2xl font-bold leading-none text-gray-900 dark:text-slate-100">
                {averageRating.toFixed(1)}
                <Box component="span" className="ml-1 text-lg font-semibold text-slate-400 dark:text-slate-500">
                  / 5.0
                </Box>

              </Box>
            </Box>
          </Stack>

          <Divider sx={{ mb: 3.2 }} />

          <Grid container spacing={3.2}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box className="mb-4 text-lg font-bold uppercase tracking-wide text-gray-900 dark:text-slate-100">
                <h3>General Information</h3>
              </Box>
              <Stack spacing={1.8}>
                <InfoCard
                  icon={<AlternateEmailRounded sx={{ fontSize: 16 }} />}
                  label="Email Address"
                  value={agent.emailAddress || "N/A"}
                />
                <InfoCard
                  icon={<PhoneRounded sx={{ fontSize: 16 }} />}
                  label="Phone Number"
                  value={agent.phoneNumber || "N/A"}
                />
              
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Box className="mb-4 text-lg font-bold uppercase tracking-wide text-gray-900 dark:text-slate-100">
                <h3>Recent Feedback</h3>
              </Box>
              <Stack spacing={1.6} sx={{ maxHeight: 340, overflowY: "auto", pr: 0.5 }}>
                {feedbackItems.map((item) => (
                  <Paper
                    key={item.id}
                    elevation={0}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box component="p" className="text-base font-bold text-gray-900 dark:text-slate-100">
                       <h4>{item.name}</h4>
                      </Box>
                      <Box component="p" className="text-sm tracking-wide text-amber-400">
                        {"★".repeat(item.rating)}
                        <span className="text-gray-300 dark:text-slate-600">{"★".repeat(5 - item.rating)}</span>
                      </Box>
                    </Stack>
                    <Box component="p" className="mt-0.5 text-xs font-medium text-gray-400 dark:text-slate-500">
                      {item.when}
                    </Box>
                    <Box component="p" className="mt-1.5 text-sm leading-6 text-gray-600 dark:text-slate-300">
                      "{item.comment}"
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <AgentEditDialog
        open={isEditOpen}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
        isSaving={isSaving}
        formValues={{
          fullName: editForm.fullName,
          emailAddress: editForm.emailAddress,
          phoneNumber: editForm.phoneNumber,
          role: editForm.role,
        }}
        errors={editErrors}
        onChange={(next) =>
          setEditForm((prev) => ({
            ...prev,
            fullName: next.fullName,
            emailAddress: next.emailAddress,
            phoneNumber: next.phoneNumber,
            role: next.role,
          }))
        }
        maxWidth="xs"
      />
    </Stack>
  );
};

export default AgentDetailsView;
