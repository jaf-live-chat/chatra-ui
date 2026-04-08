import { useState } from "react";
import type { ReactNode } from "react";
import {
  Palette,
  Type,
  MessageSquare,
  Zap,
  Bell,
  Volume2,
  Moon,
  Shield,
  Globe,
  Clock,
  Eye,
  EyeOff,
  Check,
  Copy,
  Code,
  Monitor,
  Smartphone,
  RotateCcw,
  Save,
  ExternalLink,
} from "lucide-react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Tooltip from "@mui/material/Tooltip";
import TitleTag from "../../components/TitleTag";
import { toast } from "sonner";

const themeOptions = [
  { key: "cyan", label: "Cyan", color: "#0891B2" },
  { key: "blue", label: "Blue", color: "#2563EB" },
  { key: "sky", label: "Sky", color: "#0EA5E9" },
  { key: "navy", label: "Navy", color: "#0A192F" },
  { key: "teal", label: "Teal", color: "#0E7490" },
];

const embedCode = `<!-- JAF Live Chat Widget -->
<script src="https://cdn.jaflive.chat/widget.js"></script>
<script>
  JAFChat.init({
    siteId: "YOUR_SITE_ID",
    position: "bottom-right",
    theme: "blue",
  });
</script>`;

const WidgetSettingsView = () => {
  // Widget appearance
  const [widgetTheme, setWidgetTheme] = useState(() => {
    return localStorage.getItem("jaf_theme") || "red";
  });
  const [widgetPosition, setWidgetPosition] = useState("bottom-right");
  const [widgetTitle, setWidgetTitle] = useState(() => {
    return localStorage.getItem("jaf_widget_title") || "JAF Support";
  });
  const [welcomeMessage, setWelcomeMessage] = useState(() => {
    return localStorage.getItem("jaf_welcome_message") || "👋 Hi there! Welcome to JAF Live Chat. How can I help you today?";
  });
  const [offlineMessage, setOfflineMessage] = useState(() => {
    return localStorage.getItem("jaf_offline_message") || "We're currently offline. Leave us a message and we'll get back to you!";
  });

  // Behavior
  const [autoOpen, setAutoOpen] = useState(false);
  const [autoOpenDelay, setAutoOpenDelay] = useState("5");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [darkModeDefault, setDarkModeDefault] = useState(false);
  const [quickMessagesEnabled, setQuickMessagesEnabled] = useState(true);
  const [fileUploads, setFileUploads] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(true);
  const [showAgentPhoto, setShowAgentPhoto] = useState(true);

  // Availability
  const [widgetVisible, setWidgetVisible] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [operatingHoursEnabled, setOperatingHoursEnabled] = useState(false);
  const [operatingStart, setOperatingStart] = useState("09:00");
  const [operatingEnd, setOperatingEnd] = useState("17:00");

  // Text size
  const [textSize, setTextSize] = useState("Default");

  const [codeCopied, setCodeCopied] = useState(false);

  const handleSave = () => {
    toast.success("Widget settings saved successfully!");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleReset = () => {
    setWidgetTheme("blue");
    setWidgetPosition("bottom-right");
    setWidgetTitle("JAF Support");
    setWelcomeMessage("👋 Hi there! Welcome to JAF Live Chat. How can I help you today?");
    setOfflineMessage("We're currently offline. Leave us a message and we'll get back to you!");
    localStorage.setItem("jaf_widget_title", "JAF Support");
    localStorage.setItem("jaf_welcome_message", "👋 Hi there! Welcome to JAF Live Chat. How can I help you today?");
    localStorage.setItem("jaf_offline_message", "We're currently offline. Leave us a message and we'll get back to you!");
    setAutoOpen(false);
    setAutoOpenDelay("5");
    setSoundEnabled(true);
    setPushEnabled(false);
    setDarkModeDefault(false);
    setQuickMessagesEnabled(true);
    setFileUploads(true);
    setTypingIndicator(true);
    setShowAgentPhoto(true);
    setWidgetVisible(true);
    setOfflineMode(false);
    setOperatingHoursEnabled(false);
    setTextSize("Default");
    toast.success("Settings reset to defaults.");
  };

  const SectionHeader = ({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) => (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
      <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: "#0891B214", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "grey.900", lineHeight: 1.2 }}>{title}</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>{subtitle}</Typography>
      </Box>
    </Stack>
  );

  const SettingRow = ({ icon, label, description, control }: { icon?: ReactNode; label: string; description?: string; control: ReactNode }) => (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
        {icon && <Box sx={{ color: "grey.500", display: "flex" }}>{icon}</Box>}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, color: "grey.800" }}>{label}</Typography>
          {description && <Typography variant="caption" sx={{ color: "text.secondary" }}>{description}</Typography>}
        </Box>
      </Stack>
      <Box sx={{ flexShrink: 0, ml: 2 }}>{control}</Box>
    </Stack>
  );

  return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" spacing={2}>
        <TitleTag
          title="Widget Settings"
          subtitle="Customize the appearance and behavior of your live chat widget"
          icon={<Monitor className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
        />
        <Stack direction="row" spacing={1.5}>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            startIcon={<Save size={16} />}
            sx={{ fontWeight: 600 }}
          >
            Save Changes
          </Button>
        </Stack>
      </Stack>

      {/* Two column layout */}
      <Box>
        <Paper elevation={0} sx={{ border: "1px solid", borderTopColor: "grey.200", borderRightColor: "grey.200", borderBottomColor: "grey.200", borderLeftColor: "grey.200", borderRadius: 3, p: 3 }}>
          <Stack spacing={4}>
            {/* Appearance */}
            <Box>
              <SectionHeader icon={<Palette size={18} color="#0891b2" />} title="Appearance" subtitle="Colors, text, and visual style" />

              {/* Theme Color */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: "grey.500", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1.5, display: "block" }}>
                Theme Color
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                {themeOptions.map((opt) => (
                  <Tooltip key={opt.key} title={opt.label}>
                    <Box
                      onClick={() => {
                        setWidgetTheme(opt.key);
                        localStorage.setItem("jaf_theme", opt.key);
                        window.dispatchEvent(new Event("jaf_theme_changed"));
                      }}
                      sx={{
                        width: 40, height: 40, borderRadius: 2, bgcolor: opt.color, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                        outline: widgetTheme === opt.key ? "2px solid" : "none",
                        outlineColor: "grey.400",
                        outlineOffset: 2,
                        transform: widgetTheme === opt.key ? "scale(1.1)" : "scale(1)",
                        "&:hover": { transform: "scale(1.05)" },
                      }}
                    >
                      {widgetTheme === opt.key && <Check size={18} color="#fff" />}
                    </Box>
                  </Tooltip>
                ))}
              </Stack>

              <SettingRow
                icon={<Moon size={16} />}
                label="Dark Mode by Default"
                description="Widget opens in dark mode"
                control={
                  <Switch checked={darkModeDefault} onChange={() => setDarkModeDefault(!darkModeDefault)} color="primary" />
                }
              />
            </Box>

            <Divider />

            {/* Messages */}
            <Box>
              <SectionHeader icon={<MessageSquare size={18} color="#0891b2" />} title="Messages" subtitle="Welcome text and default messages" />

              <TextField
                label="Widget Title"
                value={widgetTitle}
                onChange={(e) => {
                  setWidgetTitle(e.target.value);
                  localStorage.setItem("jaf_widget_title", e.target.value);
                }}
                fullWidth
                size="small"
                sx={{ mb: 2.5 }}
              />

              <TextField
                label="Welcome Message"
                value={welcomeMessage}
                onChange={(e) => {
                  setWelcomeMessage(e.target.value);
                  localStorage.setItem("jaf_welcome_message", e.target.value);
                }}
                fullWidth
                size="small"
                multiline
                rows={2}
                sx={{ mb: 2.5, "& .MuiInputBase-input": { cursor: "text" }, position: "relative", zIndex: 1 }}
              />

              <TextField
                label="Offline Message"
                value={offlineMessage}
                onChange={(e) => {
                  setOfflineMessage(e.target.value);
                  localStorage.setItem("jaf_offline_message", e.target.value);
                }}
                fullWidth
                size="small"
                multiline
                rows={2}
              />
            </Box>

            <Divider />

            {/* Behavior */}
            <Box>
              <SectionHeader icon={<Zap size={18} color="#0891b2" />} title="Behavior" subtitle="Auto-open, sounds, and interactions" />

              <SettingRow
                icon={<Globe size={16} />}
                label="Auto-Open Widget"
                description="Automatically open for new visitors"
                control={
                  <Switch checked={autoOpen} onChange={() => setAutoOpen(!autoOpen)} color="primary" />
                }
              />

              {autoOpen && (
                <Box sx={{ pl: 4.5, mb: 1 }}>
                  <TextField
                    label="Delay (seconds)"
                    value={autoOpenDelay}
                    onChange={(e) => setAutoOpenDelay(e.target.value)}
                    size="small"
                    type="number"
                    sx={{ width: 120 }}
                    inputProps={{ min: 1, max: 60 }}
                  />
                </Box>
              )}

              <Divider sx={{ my: 1 }} />

              <SettingRow
                icon={<Volume2 size={16} />}
                label="Message Sounds"
                description="Play sound on new messages"
                control={
                  <Switch checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} color="primary" />
                }
              />

              <SettingRow
                icon={<Bell size={16} />}
                label="Browser Push Notifications"
                description="Send desktop notifications"
                control={
                  <Switch checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} color="primary" />
                }
              />
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* Embed Code — Full Width */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3, p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <SectionHeader icon={<Code size={18} color="#0891b2" />} title="Installation Code" subtitle="Add this snippet to your website's HTML" />
          <Button
            onClick={handleCopyCode}
            variant="outlined"
            startIcon={codeCopied ? <Check size={16} /> : <Copy size={16} />}
            sx={{
              fontWeight: 600, height: 36,
              borderColor: codeCopied ? "success.main" : "grey.300",
              color: codeCopied ? "success.main" : "grey.700",
            }}
          >
            {codeCopied ? "Copied!" : "Copy Code"}
          </Button>
        </Stack>
        <Box
          sx={{
            p: 2.5, borderRadius: 2, bgcolor: "#0f172a", color: "#ffffff",
            fontFamily: "monospace", fontSize: "0.78rem", lineHeight: 1.7,
            whiteSpace: "pre-wrap", overflow: "auto", maxHeight: 200,
          }}
        >
          {embedCode}
        </Box>
        <Typography variant="caption" sx={{ color: "text.secondary", mt: 1.5, display: "block" }}>
          Place this code before the closing <code>&lt;/body&gt;</code> tag on every page where you want the chat widget to appear.
        </Typography>
      </Paper>

    </Box>
  );
}

export default WidgetSettingsView;


