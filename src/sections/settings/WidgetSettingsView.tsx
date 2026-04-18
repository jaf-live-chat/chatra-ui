import { useCallback, useEffect, useMemo, useState } from "react";
import { Monitor, RotateCcw, Save } from "lucide-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AvatarUpload from "../../components/uploads/AvatarUpload";
import TitleTag from "../../components/TitleTag";
import { toast } from "../../components/sonner";
import widgetSettingsServices from "../../services/widgetSettingsServices";
import useAuth from "../../hooks/useAuth";

const DEFAULT_ACCENT_COLOR = "#0891b2";

const normalizeCompanyName = (value?: string | null) => String(value || "").trim();

const buildDefaultWidgetTitle = (companyName?: string | null) => {
  const resolvedCompanyName = normalizeCompanyName(companyName);
  return resolvedCompanyName ? `${resolvedCompanyName} Support` : "Support";
};

const buildDefaultWelcomeMessage = (companyName?: string | null) => {
  const resolvedCompanyName = normalizeCompanyName(companyName);
  return `Hi there. Welcome to ${resolvedCompanyName || "our support team"}. How can I help you today?`;
};

const createDefaultSettings = (companyName?: string | null) => ({
  widgetTitle: buildDefaultWidgetTitle(companyName),
  welcomeMessage: buildDefaultWelcomeMessage(companyName),
  accentColor: DEFAULT_ACCENT_COLOR,
  widgetLogo: "",
});

const WidgetSettingsView = () => {
  const { tenant } = useAuth();
  const defaultSettings = useMemo(
    () => createDefaultSettings(tenant?.companyName),
    [tenant?.companyName],
  );

  const [widgetTitle, setWidgetTitle] = useState(defaultSettings.widgetTitle);
  const [welcomeMessage, setWelcomeMessage] = useState(defaultSettings.welcomeMessage);
  const [accentColor, setAccentColor] = useState(defaultSettings.accentColor);
  const [widgetLogo, setWidgetLogo] = useState(defaultSettings.widgetLogo);
  const [widgetLogoFile, setWidgetLogoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadWidgetSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await widgetSettingsServices.getWidgetSettings();
      const settings = response.widgetSettings;

      setWidgetTitle(settings.widgetTitle || defaultSettings.widgetTitle);
      setWelcomeMessage(settings.welcomeMessage || defaultSettings.welcomeMessage);
      setAccentColor(settings.accentColor || defaultSettings.accentColor);
      setWidgetLogo(settings.widgetLogo || defaultSettings.widgetLogo);
      setWidgetLogoFile(null);
    } catch (error) {
      toast.error("Failed to load widget settings");
      console.error("Error loading widget settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [defaultSettings]);

  useEffect(() => {
    void loadWidgetSettings();
  }, [loadWidgetSettings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const payload = {
        widgetTitle: widgetTitle.trim(),
        welcomeMessage: welcomeMessage.trim(),
        accentColor: accentColor.trim(),
        widgetLogo: widgetLogo.trim(),
        widgetLogoFile,
      };

      const response = await widgetSettingsServices.updateWidgetSettings(payload);
      const settings = response.widgetSettings;

      setWidgetTitle(settings.widgetTitle || defaultSettings.widgetTitle);
      setWelcomeMessage(settings.welcomeMessage || defaultSettings.welcomeMessage);
      setAccentColor(settings.accentColor || defaultSettings.accentColor);
      setWidgetLogo(settings.widgetLogo || defaultSettings.widgetLogo);
      setWidgetLogoFile(null);

      localStorage.setItem("jaf_widget_title", settings.widgetTitle || defaultSettings.widgetTitle);
      localStorage.setItem("jaf_welcome_message", settings.welcomeMessage || defaultSettings.welcomeMessage);
      localStorage.setItem("jaf_widget_accent_color", settings.accentColor || defaultSettings.accentColor);
      localStorage.setItem("jaf_widget_logo", settings.widgetLogo || defaultSettings.widgetLogo);

      toast.success("Widget settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save widget settings");
      console.error("Error saving widget settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const previewLogo = widgetLogo.trim();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={2}
      >
        <TitleTag
          title="Widget Settings"
          subtitle="Manage the public widget title, welcome copy, logo, and accent color."
          icon={<Monitor className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
        />

        <Button
          onClick={() => void handleSave()}
          variant="contained"
          startIcon={<Save size={16} />}
          disabled={isLoading || isSaving}
          sx={{ fontWeight: 600 }}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "grey.200",
          borderRadius: 3,
          p: 3,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Widget Logo
            </Typography>
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flexWrap: "wrap" }}>
              <AvatarUpload
                imageUrl={previewLogo || null}
                fullName={widgetTitle}
                onFileSelected={(file, previewUrl) => {
                  setWidgetLogo(previewUrl);
                  setWidgetLogoFile(file);
                }}
                onClear={() => {
                  setWidgetLogo("");
                  setWidgetLogoFile(null);
                }}
                onError={(message) => toast.error(message)}
                disabled={isLoading || isSaving}
              />

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Upload a logo image
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  PNG, JPG, GIF, or WEBP works best. The selected image is uploaded and saved to the widget settings API.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              Appearance
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Update the widget branding that is exposed through the API.
            </Typography>
          </Box>

          <Divider />

          <TextField
            label="Widget Title"
            value={widgetTitle}
            onChange={(event) => setWidgetTitle(event.target.value)}
            disabled={isLoading || isSaving}
            fullWidth
          />

          <TextField
            label="Welcome Message"
            value={welcomeMessage}
            onChange={(event) => setWelcomeMessage(event.target.value)}
            disabled={isLoading || isSaving}
            fullWidth
            multiline
            minRows={3}
          />

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Accent Color
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
              <TextField
                type="color"
                value={accentColor}
                onChange={(event) => setAccentColor(event.target.value)}
                disabled={isLoading || isSaving}
                sx={{ width: 88, minWidth: 88 }}
                inputProps={{ "aria-label": "Accent color picker" }}
              />
              <TextField
                label="Hex Code"
                value={accentColor}
                onChange={(event) => setAccentColor(event.target.value)}
                disabled={isLoading || isSaving}
                fullWidth
                helperText="The picker value is saved as a hex code."
              />
              <Tooltip title="Reset to default color">
                <span>
                  <IconButton
                    onClick={() => setAccentColor(defaultSettings.accentColor)}
                    disabled={isLoading || isSaving || accentColor === defaultSettings.accentColor}
                    color="primary"
                    aria-label="Reset accent color"
                  >
                    <RotateCcw size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default WidgetSettingsView;