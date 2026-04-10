import { useCallback, useEffect, useState } from "react";
import { Monitor, Save } from "lucide-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AvatarUpload from "../../components/uploads/AvatarUpload";
import TitleTag from "../../components/TitleTag";
import { toast } from "sonner";
import widgetSettingsServices from "../../services/widgetSettingsServices";

const DEFAULT_SETTINGS = {
  widgetTitle: "Support",
  welcomeMessage: "Hi there. Welcome to JAF Chatra. How can I help you today?",
  accentColor: "#0891b2",
  widgetLogo: "",
};

const WidgetSettingsView = () => {
  const [widgetTitle, setWidgetTitle] = useState(DEFAULT_SETTINGS.widgetTitle);
  const [welcomeMessage, setWelcomeMessage] = useState(DEFAULT_SETTINGS.welcomeMessage);
  const [accentColor, setAccentColor] = useState(DEFAULT_SETTINGS.accentColor);
  const [widgetLogo, setWidgetLogo] = useState(DEFAULT_SETTINGS.widgetLogo);
  const [widgetLogoFile, setWidgetLogoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadWidgetSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await widgetSettingsServices.getWidgetSettings();
      const settings = response.widgetSettings;

      setWidgetTitle(settings.widgetTitle || DEFAULT_SETTINGS.widgetTitle);
      setWelcomeMessage(settings.welcomeMessage || DEFAULT_SETTINGS.welcomeMessage);
      setAccentColor(settings.accentColor || DEFAULT_SETTINGS.accentColor);
      setWidgetLogo(settings.widgetLogo || DEFAULT_SETTINGS.widgetLogo);
      setWidgetLogoFile(null);
    } catch (error) {
      toast.error("Failed to load widget settings");
      console.error("Error loading widget settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

      setWidgetTitle(settings.widgetTitle || DEFAULT_SETTINGS.widgetTitle);
      setWelcomeMessage(settings.welcomeMessage || DEFAULT_SETTINGS.welcomeMessage);
      setAccentColor(settings.accentColor || DEFAULT_SETTINGS.accentColor);
      setWidgetLogo(settings.widgetLogo || DEFAULT_SETTINGS.widgetLogo);
      setWidgetLogoFile(null);

      localStorage.setItem("jaf_widget_title", settings.widgetTitle || DEFAULT_SETTINGS.widgetTitle);
      localStorage.setItem("jaf_welcome_message", settings.welcomeMessage || DEFAULT_SETTINGS.welcomeMessage);
      localStorage.setItem("jaf_accent_color", settings.accentColor || DEFAULT_SETTINGS.accentColor);
      localStorage.setItem("jaf_widget_logo", settings.widgetLogo || DEFAULT_SETTINGS.widgetLogo);

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
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default WidgetSettingsView;